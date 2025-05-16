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
import { AppScreen, useAppStore } from '@/store/useAppStore.ts';
import useWebsocketLifecycleService from '@/store/useWebsocketLifecycleService.ts';
import { db } from '@/db.ts';
import WebsocketLifecycleService from '@/websocket/WebsocketLifecycleService.ts';
import useSettings from '@/store/useSettings.ts';

function registerEvents(
  serverId: number,
  service: WebsocketLifecycleService,
  setScreen: (screen: AppScreen) => void,
) {

  service.registerEvent('updateToken', async (data) => {
    await db.websocketAddresses
      .where('id')
      .equals(serverId)
      .modify({ authToken: data.token });
  });

  service.registerEvent('loginStateSynced', async () => {
    setScreen('main');
  });

  service.registerEvent('requireLogin', async () => {
    setScreen('auth');
  });
}

export function useWebSocketLifecycle() {
  const { setScreen } = useAppStore();
  const { service, setService } = useWebsocketLifecycleService();
  const currentServerId = useSettings((state) => state.currentServerId);

  useEffect(() => {
    // autoconnect
    if (!currentServerId) {
      // first run
      setScreen('onboarding');
      return;
    }

    (async function() {
      const websocketAddress = await db.websocketAddresses.get(currentServerId);
      if (!websocketAddress) return;
      const service = new WebsocketLifecycleService(websocketAddress.url, websocketAddress.authToken);
      setService(service);
    })();
  }, [currentServerId, setScreen, setService]);

  useEffect(() => {
    if (!service || !currentServerId) return;
    // register events
    registerEvents(
      currentServerId,
      service,
      setScreen,
    );
    // connect to websocket
    service.connect();

    return () => {
      service.close();
    };
  }, [service, setScreen]);
}