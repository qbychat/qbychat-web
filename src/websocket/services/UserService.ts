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

import { IPacketService } from '@/websocket/types.ts';
import IWebsocketService from '@/websocket/IWebsocketService.ts';
import WebsocketEventEmitter from '@/websocket/WebsocketEventEmitter.ts';
import { create, toBinary } from '@bufbuild/protobuf';
import {
  RegisterAccountRequestSchema,
  RegisterAccountResponse,
  RegisterAccountResponse_Status,
  RegisterAccountResponseSchema,
  SyncRequestSchema,
  SyncResponseSchema,
} from '@/proto/qbychat/websocket/user/v1/service_pb';
import { RpcRequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common_pb';
import log from 'loglevel';
import { Role } from '@/proto/qbychat/websocket/user/v1/common_pb';

export type UserServiceEvents = {
  syncUser: {
    userId: string;
    username: string;
    nickname: string;
    bio?: string | null;
    registerTime?: bigint | null;
    roles: Role[]
  }
}

class UserService implements IWebsocketService {
  private readonly packetService: IPacketService;
  private readonly eventEmitter: WebsocketEventEmitter;

  constructor(packetService: IPacketService, eventEmitter: WebsocketEventEmitter) {
    this.packetService = packetService;
    this.eventEmitter = eventEmitter;
  }

  async sync(userId: string): Promise<void> {
    const request = create(SyncRequestSchema, {});

    try {
      const response = await this.packetService.request(SyncResponseSchema, userId, RpcRequestMethod.USER_SYNC_V1, toBinary(SyncRequestSchema, request));
      // push event
      this.eventEmitter.sendEvent('syncUser', {
        userId: response.privateInfo!.userId,
        username: response.publicInfo!.username,
        nickname: response.publicInfo!.nickname,
        bio: response.publicInfo!.bio,

        registerTime: response.privateInfo!.createTime?.seconds,
        roles: response.privateInfo!.roles,
      });
    } catch (error) {
      log.error(`❌ Failed to sync user info for user ${userId}`, error);
    }
  }

  async registerAccount(username: string, password: string): Promise<RegisterAccountResponse> {
    const request = create(RegisterAccountRequestSchema, {
      username: username,
      password: password,
    });

    const response = await this.packetService.request(RegisterAccountResponseSchema, null, RpcRequestMethod.REGISTER_ACCOUNT_V1, toBinary(RegisterAccountRequestSchema, request));
    if (response.status === RegisterAccountResponse_Status.SUCCESS) {
      // trigger sync
      this.eventEmitter.sendEvent('triggerSync', {
        accountId: response.accountId!,
      });
    }
    return response;
  }

}

export default UserService;