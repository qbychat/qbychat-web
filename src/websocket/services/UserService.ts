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
import {
  RegisterAccountRequest,
  RegisterAccountResponse,
  RegisterAccountResponse_Status,
} from '@/proto/qbychat/websocket/user/v1/service';
import { RequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common';

class UserService implements IWebsocketService {
  private readonly packetService: IPacketService;
  private readonly eventEmitter: WebsocketEventEmitter;

  constructor(packetService: IPacketService, eventEmitter: WebsocketEventEmitter) {
    this.packetService = packetService;
    this.eventEmitter = eventEmitter;
  }

  async sync() {
    // TODO send SyncRequest
  }

  async registerAccount(username: string, password: string): Promise<RegisterAccountResponse> {
    const request: RegisterAccountRequest = {
      username: username,
      password: password,
    };

    const response = await this.packetService.request(RegisterAccountResponse, null, RequestMethod.REGISTER_ACCOUNT_V1, RegisterAccountRequest.toBinary(request));
    if (response.status === RegisterAccountResponse_Status.SUCCESS) {
      // trigger sync
      this.eventEmitter.sendEvent('triggerSync', {
        accountId: response.accountId!
      });
    }
    return response;
  }

}

export default UserService;