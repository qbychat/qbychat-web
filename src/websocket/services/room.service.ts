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
import { SyncRequestSchema, SyncResponseSchema } from '@/proto/qbychat/rpc/room/v1/room_service_pb';
import { RpcRequestMethod } from '@/proto/qbychat/rpc/protocol/v1/rpc_messages_pb';
import { create, toBinary } from '@bufbuild/protobuf';
import WebsocketEventEmitter from '@/websocket/websocket-event-emitter.ts';
import { convertRoomV1 } from '@/mappers/room-mapper.ts';
import { IdType } from '@/types/id-types.ts';
import { IPacketService } from '@/types/websocket/packet.ts';

class RoomService implements IWebsocketService {
  private readonly packetService: IPacketService;
  private readonly eventEmitter: WebsocketEventEmitter;

  constructor(packetService: IPacketService, eventEmitter: WebsocketEventEmitter) {
    this.packetService = packetService;
    this.eventEmitter = eventEmitter;
  }

  async sync(accountId: IdType) {
    const request = create(SyncRequestSchema, {});
    const response = await this.packetService.request(SyncResponseSchema, accountId, RpcRequestMethod.ROOM_SYNC_V1, toBinary(SyncRequestSchema, request));
    // emit event
    this.eventEmitter.sendEvent('syncRoom', {
      joinedRooms: response.joinedRooms.map(room => convertRoomV1(room)),
    });
  }
}

export default RoomService;