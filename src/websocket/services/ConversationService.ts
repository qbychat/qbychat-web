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
import {  SyncResponseSchema } from '@/proto/qbychat/websocket/conversation/v1/service_pb';
import { RpcRequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common_pb';
import { Conversation } from '@/proto/qbychat/websocket/conversation/v1/common_pb';
import log from 'loglevel';

export type ConversationServiceEvents = {
  syncConversation: {
    conversations: Conversation[],
  }
}

class ConversationService implements IWebsocketService {
  private readonly packetService: IPacketService;
  private readonly eventEmttier: WebsocketEventEmitter;

  constructor(packetService: IPacketService, eventEmttier: WebsocketEventEmitter) {
    this.packetService = packetService;
    this.eventEmttier = eventEmttier;
  }

  async sync(accountId: string) {
    const response = await this.packetService.request(SyncResponseSchema, accountId, RpcRequestMethod.CONVERSATION_SYNC_V1, null);
    try {
      this.eventEmttier.sendEvent('syncConversation', {
        conversations: response.conversions
      });
    }catch (error) {
      log.error(`❌ Failed to sync conversations info for conversations ${accountId}`, error);
    }
  }
}

export default ConversationService;