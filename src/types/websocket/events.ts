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

import { IdType } from '@/types/id-types.ts';
import { SSEPayload } from './sse';
import { WebSocketStatus } from './connection';
import { UserServiceEvents } from '@/types/websocket/events/user-service-events.ts';
import { RoomServiceEvents } from '@/types/websocket/events/room-service-events.ts';

export type WebsocketEvents = {
  /* Internal Events */
  sse: SSEPayload<Uint8Array>;

  updateStatus: WebSocketStatus;
  updateToken: { token: string };
  requireLogin: null;
  switchMainAccount: { mainAccountId: IdType };
  loginStateSynced: { mainAccountId: IdType; loggedInAccountIds: IdType[] };
  triggerSync: { accountId: IdType };
  syncCompleted: { accountId: IdType };
} & UserServiceEvents
  & RoomServiceEvents;
