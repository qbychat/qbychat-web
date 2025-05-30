/*
 *  Copyright (c) 2025. All rights reserved.
 *  This file is a part of the QbyChat project
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import IWebsocketService from '@/websocket/IWebsocketService.ts';
import WebsocketEventEmitter from '@/websocket/websocket-event-emitter.ts';
import { create, toBinary } from '@bufbuild/protobuf';
import {
  UsernamePasswordLoginRequestSchema, UsernamePasswordLoginResponse,
  UsernamePasswordLoginResponse_Status, UsernamePasswordLoginResponseSchema,
} from '@/proto/qbychat/rpc/auth/v1/auth_service_pb';
import { RpcRequestMethod } from '@/proto/qbychat/rpc/protocol/v1/rpc_messages_pb';
import { parseProtobufLocalId } from '@/utils/proto-utils.ts';
import { IPacketService } from '@/types/websocket/packet.ts';

class AuthService implements IWebsocketService {
  private readonly packetService: IPacketService;
  private readonly eventEmitter: WebsocketEventEmitter;

  constructor(packetService: IPacketService, eventEmitter: WebsocketEventEmitter) {
    this.packetService = packetService;
    this.eventEmitter = eventEmitter;
  }

  async sync() {
  }

  async usernamePasswordLogin(username: string, password: string): Promise<UsernamePasswordLoginResponse> {
    const request = create(UsernamePasswordLoginRequestSchema, {
      username: username,
      password: password,
    });

    const response = await this.packetService.request(
      UsernamePasswordLoginResponseSchema,
      null, RpcRequestMethod.USERNAME_PASSWORD_LOGIN_V1,
      toBinary(UsernamePasswordLoginRequestSchema, request),
    );
    if (response.status === UsernamePasswordLoginResponse_Status.SUCCESS) {
      // login successfully
      // trigger sync
      this.eventEmitter.sendEvent('triggerSync', {
        accountId: parseProtobufLocalId(response.accountId!),
      });
    }
    return response;
  }
}

export default AuthService;