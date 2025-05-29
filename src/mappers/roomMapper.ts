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

import { ChannelRoom, GroupRoom, PrivateRoom, Room } from '@/proto/qbychat/rpc/room/v1/room_model_pb';
import { ChannelRoomModel, GroupRoomModel, PrivateRoomModel, RoomModel, RoomType } from '@/types/roomTypes.ts';
import { convertFederationIdV1 } from '@/mappers/idMapper.ts';
import { convertPublicUserInfoV1 } from '@/mappers/userMapper.ts';
import { FederationIdModel } from '@/types/idTypes.ts';

function convertPrivateRoom(proto: PrivateRoom): PrivateRoomModel {
  return {
    peerUser: convertPublicUserInfoV1(proto.peerUser!),
  };
}

function convertGroupRoom(proto: GroupRoom): GroupRoomModel {
  return {
    displayName: proto.displayName,
    description: proto.description,
    link: proto.link,
  };
}

function convertChannelRoom(proto: ChannelRoom): ChannelRoomModel {
  return {
    displayName: proto.displayName,
    description: proto.description,
    link: proto.link,
  };
}

type RoomMetadataMap = {
  private: PrivateRoomModel;
  group: GroupRoomModel;
  channel: ChannelRoomModel;
};

function createRoomModel<T extends RoomType>(
  roomId: FederationIdModel,
  type: T,
  metadata: RoomMetadataMap[T],
  unreadCount: number,
  lastMessage: { content: string },
): Extract<RoomModel, { type: T }> {
  return {
    roomId,
    type,
    metadata,
    unreadCount,
    lastMessage,
  } as Extract<RoomModel, { type: T }>;
}


function extractAndConvertRoomMetadata(
  room: Room,
): { roomType: 'private'; metadata: PrivateRoomModel }
  | { roomType: 'group'; metadata: GroupRoomModel }
  | { roomType: 'channel'; metadata: ChannelRoomModel } {
  const roomTypeMap = {
    privateRoom: 'private',
    groupRoom: 'group',
    channelRoom: 'channel',
  } as const;

  const convertMap = {
    privateRoom: convertPrivateRoom,
    groupRoom: convertGroupRoom,
    channelRoom: convertChannelRoom,
  } as const;

  const caseKey = room.details.case!;
  const convertFn = convertMap[caseKey];
  if (!convertFn) throw new Error(`No converter for case ${caseKey}`);

  const roomType = roomTypeMap[caseKey];
  const metadata = convertFn(room.details.value as never);

  return { roomType, metadata } as never;
}


export const convertRoomV1 = (room: Room): RoomModel => {
  const { roomType, metadata } = extractAndConvertRoomMetadata(room);

  return createRoomModel(
    convertFederationIdV1(room.roomId!),
    roomType,
    metadata as never,
    99,
    { content: 'TODO: wip' },
  );
};

