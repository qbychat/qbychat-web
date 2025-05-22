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

import { useEffect, useMemo, useState } from 'react';
import useAppStore, { AppScreen } from '@/store/appStore.ts';
import useWebsocketLifecycleService from '@/store/websocketLifecycleServiceStore.ts';
import { db } from '@/db.ts';
import WebsocketLifecycleService from '@/websocket/WebsocketLifecycleService.ts';
import useSettings from '@/store/settingsStore.ts';

function registerEvents(
  serverId: number,
  service: WebsocketLifecycleService,
  screen: AppScreen,
  setScreen: (screen: AppScreen) => void,
) {

  service.registerEvent('updateToken', async (data) => {
    await db.remoteServer
      .where('id')
      .equals(serverId)
      .modify({ authToken: data.token });
  });

  service.registerEvent('syncCompleted', async () => {
    if (screen === 'auth' || screen === 'loading') {
      setScreen('main');
    }
  });

  service.registerEvent('requireLogin', async () => {
    setScreen('auth');
  });
}

export function useWebSocketLifecycle() {
  const { setScreen, screen } = useAppStore();
  const setService = useWebsocketLifecycleService(state => state.setService);
  const currentServerId = useSettings((state) => state.currentServerId);

  const [websocketAddress, setWebsocketAddress] = useState<{ url: string; authToken: string | null } | null>(null);

  useEffect(() => {
    if (!currentServerId) {
      setScreen('onboarding');
      setWebsocketAddress(null);
      return;
    }

    (async () => {
      const addr = await db.remoteServer.get(currentServerId);
      if (!addr) {
        setScreen('onboarding');
        setWebsocketAddress(null);
        return;
      }
      setWebsocketAddress(addr);
    })();
  }, [currentServerId, setScreen]);

  const service = useMemo(() => {
    if (!websocketAddress) return null;
    return new WebsocketLifecycleService(websocketAddress.url, websocketAddress.authToken);
  }, [websocketAddress]);

  useEffect(() => {
    if (service) {
      setService(service);
    }
  }, [service, setService]);

  useEffect(() => {
    if (!service || !currentServerId) return;
    // register events
    registerEvents(
      currentServerId,
      service,
      screen,
      setScreen,
    );
    // connect to websocket
    (async function() {
      await service.connect();
    })();

    return () => {
      service.close();
    };
  }, [service]);
}