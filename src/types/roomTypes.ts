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

import { PublicUserProfileModel } from '@/types/userTypes.ts';
import { FederationIdModel } from '@/types/idTypes.ts';

export interface PrivateRoomModel {
  peerUser: PublicUserProfileModel;
}

export interface GroupRoomModel {
  displayName: string;
  description: string;
  link: string;
}

export interface ChannelRoomModel {
  displayName: string;
  description: string;
  link: string;
}

export const RoomTypes = ['private', 'group', 'channel'] as const;
export type RoomType = typeof RoomTypes[number];

interface RoomTypeMap {
  private: { metadata: PrivateRoomModel };
  group: { metadata: GroupRoomModel };
  channel: { metadata: ChannelRoomModel };
}

export type RoomDetails = {
  [K in keyof RoomTypeMap]: { type: K } & RoomTypeMap[K];
}[keyof RoomTypeMap];


export type RoomModel = {
  roomId: FederationIdModel;

  lastMessage: { content: string; }; // TODO replace with MessageModel
  unreadCount: number;
  // TODO multi roles (accounts/alts)
} & RoomDetails;
