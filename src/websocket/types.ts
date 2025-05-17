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

import { RPCResponse } from '@/proto/qbychat/websocket/protocol/v1/common';
import SlidingWindow from '@/websocket/SlidingWindow';
import { MessageType } from '@protobuf-ts/runtime';
import { RPCError } from '@/websocket/errors/RPCError';
import { ClientDiscoveryConfig } from '@/well-known/discovery.ts';

export type WebSocketStatus = 'connecting' | 'open' | 'waiting' | 'authenticating' | 'closed' | 'updating';

export interface RPCResponsePromiseHandlers {
  resolve: (value: RPCResponse) => void;
  reject: (reason: RPCError) => void;
}

export interface SSEPayload<T> {
  userId: string | null | undefined;
  eventType: string;
  payload: T;
}

export type WebsocketEvents = {
  sse: SSEPayload<unknown>;
  updateStatus: WebSocketStatus;
  updateToken: { token: string };
  requireLogin: null;
  loginStateSynced: { mainAccountId: string; loggedInAccountIds: string[] };
  triggerSync: { accountId: string };
  syncCompleted: { accountId: string };
}

export interface EncryptionState {
  sessionId: bigint | null;
  chacha20Key: Uint8Array | null;
  packetCounter: bigint;
  window: SlidingWindow | null;
  handshakeCompleted: boolean;
  chacha20KeyInfo: Uint8Array;
}

export interface ConnectionConfig {
  url: string;
  authToken: string | null;
  baseReconnectInterval: number;
  maxReconnectInterval: number;
}

export interface IPacketService {
  sendPacket(data: Uint8Array): void;

  request<T extends object>(
    type: MessageType<T>,
    userId: string | null,
    method: number,
    payload: Uint8Array | null,
    timeout?: number,
  ): Promise<T>;
}