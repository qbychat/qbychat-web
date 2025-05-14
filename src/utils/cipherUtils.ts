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
import sodium from 'libsodium-wrappers-sumo';
import { EncryptedMessage } from '@/proto/qbychat/websocket/protocol/v1/common.ts';

await sodium.ready; // Ensure sodium is initialized

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export function generateX25519KeyPair(): KeyPair {
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export function performKeyExchange(privateKey: Uint8Array, remotePublicKey: Uint8Array): Uint8Array {
  return sodium.crypto_scalarmult(privateKey, remotePublicKey);
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number) {
  // Initialize the result as an empty Uint8Array
  let result = new Uint8Array(0);
  let block = new Uint8Array(32); // SHA-256 block size
  let i = 1;

  // While the result is smaller than the requested length, keep expanding
  while (result.length < length) {
    // Concatenate the previous block, info, and counter (i)
    const input = new Uint8Array(block.length + info.length + 1);
    input.set(block);
    input.set(info, block.length);
    input[block.length + info.length] = i;

    // Perform HMAC-SHA256
    const hmac = sodium.crypto_auth_hmacsha256;
    block = hmac(input, prk);

    // Append the block to the result, considering the remaining length
    const remainingLength = length - result.length;
    result = new Uint8Array(result.length + Math.min(block.length, remainingLength));
    result.set(block.subarray(0, Math.min(block.length, remainingLength)), result.length - Math.min(block.length, remainingLength));

    i++;
  }

  return result;
}


export async function deriveChaCha20Key(sharedSecret: Uint8Array, info: Uint8Array): Promise<Uint8Array> {
  return await hkdfExpand(sharedSecret, info, 32);
}

export function encryptMessage(
  chachaKey: Uint8Array,
  message: Uint8Array,
  sessionId: bigint,
  sequenceNumber: bigint,
): EncryptedMessage {
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES);
  const aad = encodeAAD(sessionId, sequenceNumber);

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

export function decryptMessage(
  chachaKey: Uint8Array,
  encryptedMessage: EncryptedMessage,
): Uint8Array {
  const aad = encodeAAD(
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

function encodeAAD(sessionId: bigint, sequenceNumber: bigint): Uint8Array {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);
  view.setBigUint64(0, sessionId, false); // big-endian
  view.setBigUint64(8, sequenceNumber, false);
  return new Uint8Array(buffer);
}