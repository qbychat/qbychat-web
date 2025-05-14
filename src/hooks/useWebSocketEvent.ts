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

import { useEffect } from 'react';
import useWebSocket from '@/store/useWebSocket.ts';
import { WebsocketEvents } from '@/services/websocket/WebsocketService.ts';

export function useWebSocketEvent<T extends keyof WebsocketEvents>(
  eventName: T,
  handler: (data: WebsocketEvents[T]) => void,
) {
  const socket = useWebSocket((state) => state.socket);

  useEffect(() => {
    if (!socket) return;
    socket.registerEvent(eventName, handler);

    return () => {
      socket.unregisterEvent(eventName, handler);
    };
  }, [eventName, handler, socket]);
}