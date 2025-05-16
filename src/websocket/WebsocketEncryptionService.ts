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
  EncryptedMessage,
  ClientboundHandshake,
  ServerboundHandshake,
} from '@/proto/qbychat/websocket/protocol/v1/common';
import { EncryptionState } from './types';
import SlidingWindow from '@/websocket/SlidingWindow';
import log from 'loglevel';
import {
  decryptMessage,
  deriveChaCha20Key,
  encryptMessage,
  generateX25519KeyPair,
  KeyPair,
  performKeyExchange,
} from '@/utils/cipherUtils';

export class WebsocketEncryptionService {
  private readonly state: EncryptionState;

  constructor() {
    this.state = {
      sessionId: null,
      chacha20Key: null,
      packetCounter: BigInt(0),
      window: null,
      handshakeCompleted: false,
      chacha20KeyInfo: Uint8Array.from('qbychat-web'),
    };
  }

  /**
   * Get encryption state
   */
  getState(): EncryptionState {
    return this.state;
  }

  /**
   * Create handshake message
   */
  createHandshakeMessage(keyPair: KeyPair): Uint8Array {
    const handshake: ServerboundHandshake = {
      encryptionInfo: {
        publicKey: keyPair.publicKey,
        chacha20KeyInfo: this.state.chacha20KeyInfo,
      },
    };
    return ServerboundHandshake.toBinary(handshake);
  }

  /**
   * Handle handshake response
   */
  async handleHandshakeResponse(bytes: Uint8Array, keyPair: KeyPair): Promise<void> {
    const clientboundHandshake = ClientboundHandshake.fromBinary(bytes);
    log.debug('📥 Received handshake packet:', clientboundHandshake);

    const encryptionInfo = clientboundHandshake.encryptionInfo;
    if (encryptionInfo) {
      const serverPublicKey = encryptionInfo.publicKey;
      // do key exchange
      const sharedSecret = performKeyExchange(keyPair.privateKey, serverPublicKey);

      // calculate ChaCha20 key
      this.state.chacha20Key = await deriveChaCha20Key(
        sharedSecret,
        this.state.chacha20KeyInfo
      );

      // save session id
      this.state.sessionId = encryptionInfo.sessionId;

      // init packet counter
      this.state.packetCounter = BigInt(0);

      // init window
      this.state.window = new SlidingWindow();

      // mark handshake as completed
      this.state.handshakeCompleted = true;
      log.info('✅ Handshake finished');
    }
  }

  /**
   * Encrypt outgoing message
   */
  encryptOutgoingMessage(data: Uint8Array): Uint8Array {
    if (this.state.chacha20Key && this.state.sessionId) {
      // encrypt payload
      const packetId = this.state.packetCounter;
      const encrypted = encryptMessage(
        this.state.chacha20Key,
        data,
        this.state.sessionId,
        packetId
      );
      const payload = EncryptedMessage.toBinary(encrypted);

      // increment packet counter
      this.state.packetCounter = this.state.packetCounter + BigInt(1);

      return payload;
    }

    // not encrypted
    return data;
  }

  /**
   * Decrypt incoming message
   */
  decryptIncomingMessage(bytes: Uint8Array): { success: boolean; data?: Uint8Array } {
    if (!this.state.chacha20Key || !this.state.sessionId || !this.state.window) {
      return { success: false };
    }

    try {
      // decrypt packet
      const encryptedMessage = EncryptedMessage.fromBinary(bytes);

      // verify session id
      if (encryptedMessage.sessionId !== this.state.sessionId) {
        log.error('❌ Invalid session ID in packet', encryptedMessage);
        return { success: false };
      }

      // verify sequence number
      if (!this.state.window.accept(encryptedMessage.sequenceNumber)) {
        log.error('❌ Bad packet received (bad sequenceNumber)', encryptedMessage);
        return { success: false };
      }

      // decrypt
      const decryptedPayload = decryptMessage(this.state.chacha20Key, encryptedMessage);
      return { success: true, data: decryptedPayload };
    } catch (error) {
      log.error('❌ Failed to decrypt message:', error);
      return { success: false };
    }
  }

  /**
   * Reset encryption state
   */
  reset(): void {
    this.state.handshakeCompleted = false;
    this.state.sessionId = null;
    this.state.chacha20Key = null;
    this.state.packetCounter = BigInt(0);
    this.state.window = null;
  }

  /**
   * Generate a new X25519 key pair
   */
  generateKeyPair(): KeyPair {
    return generateX25519KeyPair();
  }

  /**
   * Check if handshake is completed
   */
  isHandshakeCompleted(): boolean {
    return this.state.handshakeCompleted;
  }
}

export default WebsocketEncryptionService;