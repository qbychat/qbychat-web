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
import sodium from 'libsodium-wrappers';
import { EncryptedMessage } from '@/proto/qbychat/websocket/protocol/v1/common.ts';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

class CipherUtils {
  async initialize(): Promise<void> {
    await sodium.ready;
  }

  generateX25519KeyPair(): KeyPair {
    const keyPair = sodium.crypto_box_keypair();
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    };
  }

  performKeyExchange(privateKey: Uint8Array, remotePublicKey: Uint8Array): Uint8Array {
    return sodium.crypto_scalarmult(privateKey, remotePublicKey);
  }

  private hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
    const BLOCK_SIZE = 32; // SHA256 block size
    let result = new Uint8Array();
    let previous = new Uint8Array(0);
    let counter = 1;

    while (result.length < length) {
      const input = new Uint8Array([...previous, ...info, counter]);
      const block = sodium.crypto_generichash(BLOCK_SIZE, input, prk);

      const needed = Math.min(block.length, length - result.length);
      result = this.concatUint8Arrays(result, block.subarray(0, needed));
      previous = block;
      counter++;
    }

    return result;
  }

  deriveChaCha20Key(sharedSecret: Uint8Array, info: Uint8Array): Uint8Array {
    return this.hkdfExpand(sharedSecret, info, 32);
  }

  encryptMessage(
    chachaKey: Uint8Array,
    message: Uint8Array,
    sessionId: bigint,
    sequenceNumber: bigint,
  ): EncryptedMessage {
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES);
    const aad = this.encodeAAD(sessionId, sequenceNumber);

    const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      message,
      aad,
      null, // secret nonce (not needed)
      nonce,
      chachaKey,
    );

    return {
      sessionId: sessionId,
      sequenceNumber: sequenceNumber,
      nonce: nonce,
      ciphertext: ciphertext,
    };
  }

  decryptMessage(
    chachaKey: Uint8Array,
    encryptedMessage: EncryptedMessage,
  ): Uint8Array {
    const aad = this.encodeAAD(
      encryptedMessage.sessionId,
      encryptedMessage.sequenceNumber,
    );

    return sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null, // secret nonce (not needed)
      encryptedMessage.ciphertext,
      aad,
      encryptedMessage.nonce,
      chachaKey,
    );
  }

  private encodeAAD(sessionId: bigint, sequenceNumber: bigint): Uint8Array {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setBigUint64(0, sessionId, false); // big-endian
    view.setBigUint64(8, sequenceNumber, false);
    return new Uint8Array(buffer);
  }

  private concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
  }
}

const instance = new CipherUtils();

export default instance;