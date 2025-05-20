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
import { IPacketService } from '@/websocket/types.ts';
import WebsocketEventEmitter from '@/websocket/WebsocketEventEmitter.ts';
import {
  UsernamePasswordLoginRequestSchema,
  UsernamePasswordLoginResponse,
  UsernamePasswordLoginResponse_Status,
  UsernamePasswordLoginResponseSchema,
} from '@/proto/qbychat/websocket/auth/v1/service_pb';
import { RPCRequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common_pb';
import { create, toBinary } from '@bufbuild/protobuf';

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
      null, RPCRequestMethod.USERNAME_PASSWORD_LOGIN_V1,
      toBinary(UsernamePasswordLoginRequestSchema, request),
    );
    if (response.status === UsernamePasswordLoginResponse_Status.SUCCESS) {
      // login successfully
      // trigger sync
      this.eventEmitter.sendEvent('triggerSync', {
        accountId: response.accountId!,
      });
    }
    return response;
  }
}

export default AuthService;