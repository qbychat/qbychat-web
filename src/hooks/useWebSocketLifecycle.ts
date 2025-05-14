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
import WebsocketService from '@/services/websocket/WebsocketService.ts';
import useSettings from '@/store/useSettings.ts';

function registerEvents(service: WebsocketService) {

  service.registerEvent('updateToken', async (data) => {
    const entity = await db.websocketAddresses
      .filter(server => server.url === service.url)
      .first();
    if (!entity) return;
    entity.authToken = data.token;
    // FIXME cannot save websocket address
    await db.websocketAddresses.put(entity);
  });

  service.registerEvent('loginSuccess', async () => {
    // TODO setScreen for main
  });

  service.registerEvent('requireLogin', async () => {
    // TODO setScreen for auth
  });
}

export function useWebSocketLifecycle() {
  const { setScreen } = useAppStore();
  const { service, setService } = useWebSocket();
  const currentServer = useSettings((state) => state.currentServerId);

  useEffect(() => {
    // autoconnect
    if (!currentServer) return;

    (async function() {
      const websocketAddress = await db.websocketAddresses.get(currentServer);
      if (!websocketAddress) return;
      const service = new WebsocketService(websocketAddress.url, websocketAddress.authToken);
      setService(service);
    })();
  }, [currentServer, setService]);

  useEffect(() => {
    if (!service) return;
    // register events
    registerEvents(service);
    // connect to websocket
    service.connect();

    return () => {
      service.close();
    };
  }, [service, setScreen]);
}