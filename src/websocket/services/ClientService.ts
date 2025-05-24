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

import IWebsocketService from '@/websocket/IWebsocketService.ts';
import log from 'loglevel';
import { UAParser } from 'ua-parser-js';
import { IPacketService } from '@/websocket/types.ts';
import {
  RegisterClientRequestSchema,
  RegisterClientResponseSchema,
  ResumeClientRequestSchema,
  ResumeClientResponseSchema,
} from '@/proto/qbychat/websocket/session/v1/service_pb';
import { create, toBinary } from '@bufbuild/protobuf';
import { Platform } from '@/proto/qbychat/common/v1/platform_pb';
import { RpcRequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common_pb';

class ClientService implements IWebsocketService {
  private readonly packetService: IPacketService;

  constructor(lifecycleService: IPacketService) {
    this.packetService = lifecycleService;
  }

  async sync() {
  }

  async resumeClient(authToken: string) {
    const request = create(ResumeClientRequestSchema, {
      token: authToken,
    });

    log.debug('📦 ResumeClientRequest:', request);
    return await this.packetService.request(
      ResumeClientResponseSchema,
      null,
      RpcRequestMethod.RESUME_CLIENT_V1,
      toBinary(ResumeClientRequestSchema, request),
    );
  }

  async registerClient() {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

    if (!isBrowser) {
      throw new Error('Nodejs is currently unsupported');
    }

    // parse User-Agent
    const ua = UAParser(navigator.userAgent);

    const request = create(RegisterClientRequestSchema, {
      clientMetadata: {
        clientName: __APP_NAME__,
        clientVersion: __APP_VERSION__,
        platform: Platform.BROWSER,
        platformDetails: `${ua.browser.name} v${ua.browser.version} on ${ua.os.name}`,
      },
    });

    // send request
    log.info('🚀 Begin Registering client', request);
    const response = await this.packetService.request(
      RegisterClientResponseSchema,
      null,
      RpcRequestMethod.REGISTER_CLIENT_V1,
      toBinary(RegisterClientRequestSchema, request),
    );

    log.info('📥 Successfully registered client');
    log.debug(`📥 Client authToken: ${response.token}`);

    return response;
  }
}

export default ClientService;
