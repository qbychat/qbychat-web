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
import log from 'loglevel';
import {
  QueryUserRequestSchema,
  QueryUserResponse,
  QueryUserResponseSchema,
  RegisterAccountRequestSchema,
  RegisterAccountResponse,
  RegisterAccountResponse_Status,
  RegisterAccountResponseSchema,
  SyncRequestSchema,
  SyncResponseSchema,
} from '@/proto/qbychat/rpc/user/v1/user_service_pb';
import { RpcRequestMethod } from '@/proto/qbychat/rpc/protocol/v1/rpc_messages_pb';
import { parseProtobufLocalId } from '@/utils/protoUtils.ts';
import { IdType } from '@/types/idTypes.ts';

export type UserServiceEvents = {
  syncUser: {
    userId: IdType;
    username: string;
    nickname: string;
    bio?: string | null;
    registerTime?: bigint | null;
  }
}

class UserService implements IWebsocketService {
  private readonly packetService: IPacketService;
  private readonly eventEmitter: WebsocketEventEmitter;

  constructor(packetService: IPacketService, eventEmitter: WebsocketEventEmitter) {
    this.packetService = packetService;
    this.eventEmitter = eventEmitter;
  }

  async sync(userId: IdType): Promise<void> {
    const request = create(SyncRequestSchema, {});

    try {
      const response = await this.packetService.request(SyncResponseSchema, userId, RpcRequestMethod.USER_SYNC_V1, toBinary(SyncRequestSchema, request));
      // push event
      if (!response.publicInfo?.userId?.localId) {
        log.error(`❌ Failed to sync user info for user ${userId}: localId missing`);
        return;
      }

      this.eventEmitter.sendEvent('syncUser', {
        userId: parseProtobufLocalId(response.publicInfo!.userId?.localId)!,
        username: response.publicInfo!.username,
        nickname: response.publicInfo!.nickname,
        bio: response.publicInfo!.bio,

        registerTime: response.privateInfo!.createTime?.seconds,
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

  async queryUserByUsername(selfUserId: IdType, username: string, domain?: string): Promise<QueryUserResponse> {
    const request = create(QueryUserRequestSchema, {
      identifier: {
        case: 'username',
        value: {
          domain: domain,
          username: username,
        },
      },
    });

    return await this.packetService.request(QueryUserResponseSchema, selfUserId, RpcRequestMethod.QUERY_USER_V1, toBinary(QueryUserRequestSchema, request));
  }
}

export default UserService;