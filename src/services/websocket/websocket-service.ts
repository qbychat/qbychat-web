/*
 * Copyright (c) 2025. All rights reserved.
 *
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
import CipherUtils, { KeyPair } from '@/utils/cipher-utils.ts';
import BinaryUtils from '@/utils/binary-utils.ts';
import SlidingWindow from '@/services/websocket/sliding-window.ts';
import { v4 as uuidv4 } from 'uuid';
import mitt from 'mitt';
import { MessageType } from '@protobuf-ts/runtime';
import { RPCError } from '@/services/websocket/websocket-error.ts';
import Queue from 'queue';

export type WebSocketStatus = 'connecting' | 'open' | 'closed';

interface RPCResponsePromiseHandlers {
  resolve: (value: RPCResponse) => void;
  reject: (reason: RPCError) => void;
}

interface WebSocketEvent {
  userId: string | null | undefined;
  payload: Uint8Array;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  readonly url: string;
  private maxReconnectInterval: number = 30000;
  private readonly baseReconnectInterval: number;
  private reconnectInterval: number;
  private reconnectAttempts = 0;

  public emitter = mitt<Record<string, WebSocketEvent>>();

  #ticketCounter: number = 0;

  #shouldReconnect: boolean = true;
  #reconnectTimer: NodeJS.Timeout | null = null;

  readonly #chacha20KeyInfo = Uint8Array.from('qbychat-web');
  #handshakeState: boolean = false;
  #sessionId: bigint | null = null;
  #chacha20Key: Uint8Array | null = null;
  #packetCounter: Int32Array | null = null;
  #packetQueue: Queue = new Queue({ results: [] });
  #responseHandlers: Map<Uint8Array, RPCResponsePromiseHandlers> = new Map();
  #statusListeners: Map<string, (status: WebSocketStatus) => void> = new Map();
  #window: SlidingWindow | null = null;

  constructor(url: string, baseReconnectInterval: number = 5000) {
    this.url = url;
    this.baseReconnectInterval = baseReconnectInterval;
    this.reconnectInterval = baseReconnectInterval;
  }

  connect() {
    if (this.socket !== null) {
      return; // already connected
    }

    // create socket
    this.socket = new WebSocket(this.url);
    this.updateStatus('connecting');

    // create keypair for key exchange
    let keyPair: KeyPair | undefined = CipherUtils.generateX25519KeyPair();

    this.socket.onopen = () => {
      // socket opened
      // reset state
      this.reconnectAttempts = 0;
      this.reconnectInterval = this.baseReconnectInterval;
      this.#handshakeState = false;
      this.#shouldReconnect = true;

      // do handshake
      // create X25519KeyPair
      const serverboundHandshake: ServerboundHandshake = {
        encryptionInfo: {
          publicKey: keyPair!.publicKey,
          chacha20KeyInfo: this.#chacha20KeyInfo,
        },
      };
      // send handshake packet
      this.socket!.send(ServerboundHandshake.toBinary(serverboundHandshake));
    };

    this.socket.onmessage = async (e: MessageEvent) => {
      // read buffer
      const bytes = await BinaryUtils.blobToByteArray(e.data);
      if (!this.#handshakeState) {
        // process handshake
        const clientboundHandshake = ClientboundHandshake.fromBinary(bytes);
        const encryptionInfo = clientboundHandshake.encryptionInfo;
        if (encryptionInfo) {
          const serverPublicKey = encryptionInfo.publicKey;
          // do key exchange
          const sharedSecret = CipherUtils.performKeyExchange(keyPair!.privateKey, serverPublicKey);
          // calculate ChaCha20 key
          this.#chacha20Key = CipherUtils.deriveChaCha20Key(sharedSecret, this.#chacha20KeyInfo);
          // save session id
          this.#sessionId = encryptionInfo.sessionId;

          // init packet counter
          this.#packetCounter = new Int32Array(new SharedArrayBuffer(1024));
          // init window
          this.#window = new SlidingWindow();
        }
        this.updateStatus('open');
        this.#handshakeState = true;
        // free keyPair object
        keyPair = undefined;
        // push packets in the queue
        // TODO send packet after reconnect
        this.#packetQueue.start().then(() => {
          console.log('Successfully send cached packets!');
        });
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
          const decryptedPayload = CipherUtils.decryptMessage(this.#chacha20Key, encryptedMessage);
          clientboundMessage = ClientboundMessage.fromBinary(decryptedPayload);
          if (!this.#window!.accept(encryptedMessage.sequenceNumber)) {
            // bad sequenceNumber
            // drop packet
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
      console.error('WebSocket error:', error);
    };
  }

  sendPacket(data: Uint8Array) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      let payload: Uint8Array;
      if (this.#chacha20Key && this.#sessionId) {
        // encrypt payload
        const packetId = BigInt(Atomics.load(this.#packetCounter!, 0));
        payload = EncryptedMessage.toBinary(CipherUtils.encryptMessage(this.#chacha20Key, data, this.#sessionId, packetId));
      } else {
        // not encrypted
        payload = data;
      }
      // send payload
      this.socket.send(payload);
      if (this.#packetCounter) {
        // move packet counter
        Atomics.add(this.#packetCounter, 0, 1);
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
      const ticket = BinaryUtils.numberToUint8(++this.#ticketCounter);
      // build request
      const message: ServerboundMessage = {
        userId: userId === null ? undefined : userId,
        request: {
          ticket: ticket,
          method: method,
          payload: payload === null ? undefined : payload,
        },
      };

      // send request
      this.sendPacket(ServerboundMessage.toBinary(message));

      // Set a timeout to reject the promise after the specified time
      const timeoutId = setTimeout(() => {
        // If the timeout occurs, reject the promise
        console.error(`Request with ticket ${ticket} timed out after ${timeout}ms`);
        this.#responseHandlers.delete(ticket); // Clean up the ticket from the map
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      const callback = (response: RPCResponse) => {
        // clean timeout
        clearTimeout(timeoutId);
        // parse payload
        resolve(type.fromBinary(response.payload!));
      };

      this.#responseHandlers.set(ticket, {
        resolve: callback,
        reject: reject,
      });
    });
  }

  private handlePacket(packet: ClientboundMessage) {
    const userId = packet.userId;
    if (packet.content.oneofKind == 'response') {
      // handle response
      const response = packet.content.response;
      const responseHandler = this.#responseHandlers.get(response.ticket!);
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
        this.#responseHandlers.delete(response.ticket!);
      }
    } else if (packet.content.oneofKind == 'event') {
      // handle event
      const event = packet.content.event;
      // emit event
      this.emitter.emit(event.typeUrl, {
        userId: userId,
        payload: event.value,
      });
    }
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

    this.#reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
  }

  private updateStatus(status: WebSocketStatus) {
    this.#statusListeners.forEach((listener) => listener(status));
  }

  addStatusListener(listener: (status: WebSocketStatus) => void): string {
    const id: string = uuidv4().toString();
    this.#statusListeners.set(id, listener);
    return id;
  }

  removeStatusListener(id: string) {
    this.#statusListeners.delete(id);
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
    }
  }
}

export default WebSocketService;