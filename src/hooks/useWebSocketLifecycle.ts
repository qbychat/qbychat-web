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
import { useAppStore } from '@/store/useAppStore.ts';
import useWebSocket from '@/store/useWebSocket.ts';
import { db } from '@/db.ts';

export function useWebSocketLifecycle() {
  const { setScreen } = useAppStore();
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    socket.registerEvent('updateToken', async (data) => {
      const entity = await db.websocketAddresses
        .filter(server => server.url === socket.url)
        .first();
      if (!entity) return;
      entity.authToken = data.token;
      await db.websocketAddresses.put(entity);
    });

    socket.connect();

    return () => {
      socket.close();
    };
  }, [socket, setScreen]);
}