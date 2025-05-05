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
  ClientboundHandshake, ClientboundMessage,
  EncryptedMessage,
  ServerboundHandshake,
} from '@/proto/qbychat/websocket/protocol/v1/common.ts';
import CipherUtils, { KeyPair } from '@/utils/cipher-utils.ts';
import BinaryUtils from '@/utils/binary-utils.ts';
import SlidingWindow from '@/services/websocket/sliding-window.ts';
import { websocketEmitter } from '@/services/websocket/websocket-eventbus.ts';

class WebSocketClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private maxReconnectInterval: number = 30000;
  private readonly baseReconnectInterval: number;
  private reconnectInterval: number;
  private reconnectAttempts = 0;

  #shouldReconnect = true;

  readonly #chacha20KeyInfo = Uint8Array.from('qbychat-web');
  #handshakeState: boolean = false;
  #sessionId: bigint | null = null;
  #chacha20Key: Uint8Array | null = null;
  #packetCounter: Int32Array | null = null;
  #packetQueue: Uint8Array[] = [];
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
        this.#handshakeState = true;
        // free keyPair object
        keyPair = undefined;
        // push packets in the queue
        while (this.#packetQueue.length > 0) {
          const packet = this.#packetQueue.pop();
          if (packet) {
            // push packet
            this.sendPacket(packet);
          }
        }
        return;
      }

      // process packet
      let clientboundMessage: ClientboundMessage;
      if (this.#chacha20Key) {
        // decrypt packet
        const encryptedMessage = EncryptedMessage.fromBinary(bytes);
        // verify packet
        if (this.#sessionId == encryptedMessage.sessionId && this.#window!.accept(encryptedMessage.sequenceNumber)) {
          const decryptedPayload = CipherUtils.decryptMessage(this.#chacha20Key, encryptedMessage);
          clientboundMessage = ClientboundMessage.fromBinary(decryptedPayload);
        } else {
          // invalid packet
          return; // drop this packet
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
      // add to queue
      this.#packetQueue.push(data);
    }
  }


  private handlePacket(packet: ClientboundMessage) {
    const userId = packet.userId;
    if (packet.content.oneofKind == 'response') {
      // handle response
      // const response = packet.content.response;
      // TODO handle response
    } else if (packet.content.oneofKind == 'event') {
      // handle event
      const event = packet.content.event;
      // emit event
      websocketEmitter.emit(event.typeUrl, {
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

    setTimeout(() => this.connect(), this.reconnectInterval);
  }

  close() {
    if (this.socket) {
      this.#shouldReconnect = false;
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketClient;