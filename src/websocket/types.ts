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

import SlidingWindow from '@/websocket/SlidingWindow';
import { RpcError } from '@/websocket/errors/RpcError.ts';
import { Message } from '@bufbuild/protobuf';
import { GenMessage } from '@bufbuild/protobuf/codegenv1';
import { UserServiceEvents } from '@/websocket/services/UserService.ts';
import { RpcResponse } from '@/proto/qbychat/rpc/protocol/v1/rpc_messages_pb';
import { IdType } from '@/types/idTypes.ts';
import { RoomServiceEvents } from '@/websocket/services/RoomService.ts';

export type WebSocketStatus = 'connecting' | 'open' | 'waiting' | 'authenticating' | 'closed' | 'updating';

export interface RpcResponsePromiseHandlers {
  resolve: (value: RpcResponse) => void;
  reject: (reason: RpcError) => void;
}

export interface SSEPayload<T> {
  userId: IdType | null | undefined;
  eventType: string;
  payload: T;
}

export type WebsocketEvents = {
  /* Internal Events */
  sse: SSEPayload<unknown>;

  updateStatus: WebSocketStatus;
  updateToken: { token: string };
  requireLogin: null;
  switchMainAccount: { mainAccountId: IdType };
  loginStateSynced: { mainAccountId: IdType; loggedInAccountIds: IdType[] };
  triggerSync: { accountId: IdType };
  syncCompleted: { accountId: IdType };

} & UserServiceEvents & RoomServiceEvents;

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

  request<T extends Message>(
    responseType: GenMessage<T>,
    userId: IdType | null | undefined,
    method: number,
    payload: Uint8Array | null,
    timeout?: number,
  ): Promise<T>;
}