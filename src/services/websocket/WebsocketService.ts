/*
 * Copyright (c) 2025. All rights reserved.
 * This file is a part of the QbyChat project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {
  ClientboundHandshake,
  ClientboundMessage,
  EncryptedMessage,
  RequestMethod,
  RPCResponse,
  RPCResponse_Status,
  ServerboundHandshake,
  ServerboundMessage,
} from '@/proto/qbychat/websocket/protocol/v1/common.ts';
import SlidingWindow from '@/services/websocket/SlidingWindow.ts';
import mitt from 'mitt';
import { MessageType } from '@protobuf-ts/runtime';
import { RPCError } from '@/services/websocket/errors/RPCError.ts';
import Queue from 'queue';
import { Platform } from '@/proto/qbychat/common/v1/platform.ts';
import { UAParser } from 'ua-parser-js';
import {
  RegisterClientRequest,
  RegisterClientResponse,
  ResumeClientRequest,
  ResumeClientResponse,
} from '@/proto/qbychat/websocket/session/v1/service.ts';
import { sha256 } from 'js-sha256';
import log from 'loglevel';
import {
  decryptMessage,
  deriveChaCha20Key,
  encryptMessage,
  generateX25519KeyPair,
  KeyPair,
  performKeyExchange,
} from '@/utils/cipherUtils.ts';
import { blobToByteArray, numToUint8Array } from '@/utils/binaryUtils.ts';

export type WebSocketStatus = 'connecting' | 'open' | 'waiting' | 'authenticating' | 'closed' | 'updating';

interface RPCResponsePromiseHandlers {
  resolve: (value: RPCResponse) => void;
  reject: (reason: RPCError) => void;
}

interface SSEPayload<T> {
  userId: string | null | undefined;
  eventType: string;
  payload: T;
}

export type WebsocketEvents = {
  sse: SSEPayload<unknown>;
  updateStatus: WebSocketStatus;
  updateToken: { token: string };
}

class WebsocketService {
  private socket: WebSocket | null = null;
  readonly url: string;
  private readonly authToken: string | null;
  private maxReconnectInterval: number = 30000;
  private readonly baseReconnectInterval: number;
  private reconnectInterval: number;
  private reconnectAttempts = 0;

  private emitter = mitt<WebsocketEvents>();

  #ticketCounter: number = 0;

  #shouldReconnect: boolean = true;
  #reconnectTimer: NodeJS.Timeout | null = null;

  readonly #chacha20KeyInfo = Uint8Array.from('qbychat-web');
  #handshakeState: boolean = false;
  #sessionId: bigint | null = null;
  #chacha20Key: Uint8Array | null = null;
  #packetCounter: bigint = BigInt(0);
  #packetQueue: Queue = new Queue({ results: [] });
  #responseHandlers: Map<string, RPCResponsePromiseHandlers> = new Map();
  #window: SlidingWindow | null = null;

  constructor(url: string, authToken: string | null, baseReconnectInterval: number = 5000) {
    this.url = url;
    this.authToken = authToken;
    this.baseReconnectInterval = baseReconnectInterval;
    this.reconnectInterval = baseReconnectInterval;
  }

  testConnection(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.socket !== null && this.socket.readyState === WebSocket.OPEN) {
        resolve(true); // already connected
        return;
      }

      const socket = new WebSocket(this.url);

      const timeoutId = setTimeout(() => {
        socket.close();
        resolve(false);
      }, 5000);

      socket.onopen = () => {
        clearTimeout(timeoutId);
        socket.close();
        resolve(true); // connection successful
      };

      socket.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };

      socket.onclose = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
    });
  }


  connect() {
    if (this.socket !== null) {
      return; // already connected
    }

    // create socket
    this.socket = new WebSocket(this.url);
    this.updateStatus('connecting');

    log.info(`🚀 Start connecting to websocket ${this.url}`);

    // create keypair for key exchange
    let keyPair: KeyPair | undefined = generateX25519KeyPair();
    log.debug('✅ Created X25519 keypair');

    this.socket.onopen = () => {
      // socket opened
      // reset state
      this.reconnectAttempts = 0;
      this.reconnectInterval = this.baseReconnectInterval;
      this.#handshakeState = false;
      this.#shouldReconnect = true;

      log.info(`✅ Success connect to websocket ${this.url}, start handshake`);

      // do handshake
      // create X25519KeyPair
      const serverboundHandshake: ServerboundHandshake = {
        encryptionInfo: {
          publicKey: keyPair!.publicKey,
          chacha20KeyInfo: this.#chacha20KeyInfo,
        },
      };
      // send handshake packet
      log.debug('📦 Send handshake packet:', serverboundHandshake);
      this.socket!.send(ServerboundHandshake.toBinary(serverboundHandshake));
    };

    this.socket.onmessage = async (e: MessageEvent) => {
      // read buffer
      const bytes = await blobToByteArray(e.data);
      if (!this.#handshakeState) {
        // process handshake
        const clientboundHandshake = ClientboundHandshake.fromBinary(bytes);
        log.debug('📥 Received handshake packet:', clientboundHandshake);
        const encryptionInfo = clientboundHandshake.encryptionInfo;
        if (encryptionInfo) {
          const serverPublicKey = encryptionInfo.publicKey;
          // do key exchange
          const sharedSecret = performKeyExchange(keyPair!.privateKey, serverPublicKey);
          // calculate ChaCha20 key
          this.#chacha20Key = await deriveChaCha20Key(sharedSecret, this.#chacha20KeyInfo);
          // save session id
          this.#sessionId = encryptionInfo.sessionId;

          // init packet counter
          this.#packetCounter = BigInt(0);
          // init window
          this.#window = new SlidingWindow();
        }
        log.info('✅ Handshake finished');
        this.#handshakeState = true;
        // authorize
        this.updateStatus('authenticating');
        // register/restore session
        if (this.authToken) {
          await this.resumeSession();
        } else {
          await this.registerClient();
        }

        // free keyPair object
        keyPair = undefined;
        // TODO send sync requests
        log.info('🚀 Begin updating data');
        this.updateStatus('updating');
        // push packets in the queue
        // send packet after reconnect
        log.info('🚀 Begin sending queued packets');
        await this.#packetQueue.start().then(() => {
          log.info('✅ Success send all queued packets');
        });
        log.info('✅ Websocket is ready');
        this.updateStatus('open'); // now the websocket is ready
        return;
      }

      // process packet
      let clientboundMessage: ClientboundMessage;
      if (this.#chacha20Key) {
        // decrypt packet
        const encryptedMessage = EncryptedMessage.fromBinary(bytes);
        // verify packet
        if (encryptedMessage.sessionId != this.#sessionId) {
          // invalid session id
          return;
        }
        try {
          // decrypt packet
          const decryptedPayload = decryptMessage(this.#chacha20Key, encryptedMessage);
          clientboundMessage = ClientboundMessage.fromBinary(decryptedPayload);
          if (!this.#window!.accept(encryptedMessage.sequenceNumber)) {
            // bad sequenceNumber
            // drop packet
            log.error('❌ Bad packet received (bad sequenceNumber)', encryptedMessage);
            return;
          }
        } catch {
          // invalid packet
          // drop
          return;
        }
      } else {
        // plaintext
        clientboundMessage = ClientboundMessage.fromBinary(bytes);
      }
      // call handlePacket
      this.handlePacket(clientboundMessage);
    };

    this.socket.onclose = () => {
      // do reconnect
      this.updateStatus('closed');
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      log.error('WebSocket error:', error);
    };
  }

  sendPacket(data: Uint8Array) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      let payload: Uint8Array;
      if (this.#chacha20Key && this.#sessionId) {
        // encrypt payload
        const packetId = this.#packetCounter;
        payload = EncryptedMessage.toBinary(encryptMessage(this.#chacha20Key, data, this.#sessionId, packetId));
      } else {
        // not encrypted
        payload = data;
      }
      // send payload
      this.socket.send(payload);
      if (this.#packetCounter) {
        // move packet counter
        ++this.#packetCounter;
      }
    } else {
      // add task to queue
      this.#packetQueue.push(() => {
        return new Promise<void>((resolve, reject) => {
          try {
            this.sendPacket(data);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  async request<T extends object>(type: MessageType<T>, userId: string | null, method: RequestMethod, payload: Uint8Array | null, timeout: number = 15000): Promise<T> {
    return new Promise((resolve, reject) => {
      // create ticket
      const ticket = numToUint8Array(++this.#ticketCounter);
      const ticketHash = sha256(ticket);
      // build request
      const message: ServerboundMessage = {
        userId: userId === null ? undefined : userId,
        request: {
          ticket: ticket,
          method: method,
          payload: payload === null ? undefined : payload,
        },
      };

      // Set a timeout to reject the promise after the specified time
      const timeoutId = setTimeout(() => {
        // If the timeout occurs, reject the promise
        log.error(`❌ Request with ticket ${ticketHash} timed out after ${timeout}ms`);
        this.#responseHandlers.delete(ticketHash); // Clean up the ticket from the map
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      const callback = (response: RPCResponse) => {
        // clean timeout
        clearTimeout(timeoutId);
        // parse payload
        resolve(type.fromBinary(response.payload!));
      };

      this.#responseHandlers.set(ticketHash, {
        resolve: callback,
        reject: reject,
      });

      // send request
      log.info(`📦 Request: method ${method}`, { ticketHash });
      log.debug(`📦 Payload for method ${method}`, { ticketHash, payload });

      this.sendPacket(ServerboundMessage.toBinary(message));
    });
  }

  private handlePacket(packet: ClientboundMessage) {
    const userId = packet.userId;
    if (packet.content.oneofKind == 'response') {
      // handle response
      const response = packet.content.response;
      const ticketHash = sha256(response.ticket!);
      log.info(`📥 Received response with ticket ${ticketHash}`);
      log.debug('📥 Received response', response);
      const responseHandler = this.#responseHandlers.get(ticketHash);
      if (responseHandler) {
        // invoke handler
        if (response.status === RPCResponse_Status.SUCCESS) {
          // success
          responseHandler.resolve(response);
        } else {
          // error
          responseHandler.reject(new RPCError(response.status, response.message));
        }
        // cleanup handler
        this.#responseHandlers.delete(ticketHash);
      }
    } else if (packet.content.oneofKind == 'event') {
      // handle event
      const event = packet.content.event;
      log.info(`Received event ${event.typeUrl}`);
      // emit event
      this.sendSseEvent(userId, event.typeUrl, event.value);
    }
  }

  private async resumeSession() {
    if (!this.authToken) throw new Error('Auth token is missing');
    log.info('🚀 Start to resume session');
    const request: ResumeClientRequest = {
      token: this.authToken,
    };
    log.debug(`📦 ResumeClientRequest: ${request}`);
    await this.request(ResumeClientResponse, null, RequestMethod.RESUME_CLIENT_V1, ResumeClientRequest.toBinary(request));
  }

  private async registerClient() {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    let request: RegisterClientRequest;

    if (isBrowser) {
      // parse User-Agent
      const ua = UAParser(navigator.userAgent);

      request = {
        clientMetadata: {
          clientName: __APP_NAME__,
          clientVersion: __APP_VERSION__,
          platform: Platform.BROWSER,
          platformDetails: `${ua.browser.name} v${ua.browser.version} on ${ua.os.name}`,
        },
      };
    } else {
      throw new Error('Nodejs is current unsupported');
    }
    // send request
    log.info('🚀 Begin Registering client', request);
    const response = await this.request(RegisterClientResponse, null, RequestMethod.REGISTER_CLIENT_V1, RegisterClientRequest.toBinary(request));
    log.info('📥 Successfully registered client');
    log.debug(`📥 Client authToken: ${response.token}`);
    // send event
    this.sendEvent('updateToken', {
      token: response.token,
    });
  }

  private handleReconnect() {
    if (this.socket === null || !this.#shouldReconnect) {
      // manually closed socket, skip reconnect
      return;
    }
    this.socket = null;
    this.reconnectAttempts++;
    // calculate new reconnect interval
    this.reconnectInterval = Math.min(
      this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectInterval,
    );

    // update status
    this.updateStatus('waiting');
    this.#reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
  }

  private updateStatus(status: WebSocketStatus) {
    this.sendEvent('updateStatus', status);
  }

  registerEvent<T extends keyof WebsocketEvents>(eventName: T, handler: (data: WebsocketEvents[T]) => void) {
    this.emitter.on(eventName, handler);
  }

  unregisterEvent<T extends keyof WebsocketEvents>(eventName: T, handler: (data: WebsocketEvents[T]) => void) {
    this.emitter.off(eventName, handler);
  }

  private sendEvent<T extends keyof WebsocketEvents>(eventName: T, data: WebsocketEvents[T]) {
    this.emitter.emit(eventName, data);
  }

  private sendSseEvent<T>(userId: string | null | undefined, eventType: string, payload: T) {
    const ssePayload: SSEPayload<T> = {
      userId,
      eventType,
      payload,
    };
    this.sendEvent('sse', ssePayload);
  }

  close() {
    if (this.socket) {
      if (this.#reconnectTimer) {
        // avoid reconnect
        clearTimeout(this.#reconnectTimer);
      }
      this.#shouldReconnect = false;
      this.socket.close();
      this.socket = null;

      // unregister all events
      this.emitter.all.clear();
    }
  }
}

export default WebsocketService;