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

import useWebsocketLifecycleServiceStore from '@/stores/websocket-lifecycle-service-store.ts';
import useAppStore from '@/stores/app-store.ts';
import useAccountStore from '@/stores/account-store.ts';
import useSettings from '@/stores/settings-store.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { db } from '@/db.ts';
import WebsocketLifecycleService from '@/websocket/websocket-lifecycle-service.ts';
import { WebsocketEvents } from '@/types/websocket/events.ts';

export function useWebSocketLifecycleManager() {
  const setScreen = useAppStore(s => s.setScreen);
  const setConnectionStatus = useAppStore(s => s.setConnectionStatus);
  const screen = useAppStore(s => s.screen);

  const addAccount = useAccountStore(s => s.addAccount);
  const selectMainAccount = useAccountStore(s => s.selectMainAccount);

  const setService = useWebsocketLifecycleServiceStore(state => state.setService);
  const currentServerId = useSettings((state) => state.currentServerId);

  const [websocketAddress, setWebsocketAddress] = useState<{ url: string; authToken: string | null } | null>(null);

  const currentServerIdRef = useRef(currentServerId);
  const screenRef = useRef(screen);

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
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    if (!service || !currentServerIdRef.current) return;
    // register events
    service.registerEvent('updateToken', async (data) => {
      await db.remoteServer
        .where('id')
        .equals(currentServerIdRef.current!)
        .modify({ authToken: data.token });
    });

    service.registerEvent('syncCompleted', async () => {
      if (screenRef.current === 'auth') {
        setScreen('main');
      }
    });

    service.registerEvent('requireLogin', async () => {
      setScreen('auth');
    });

    service.registerEvent('updateStatus', async (status) => {
      setConnectionStatus(status);
    });

    service.registerEvent('switchMainAccount', async (data) => {
      selectMainAccount(data.mainAccountId);
    });

    service.registerEvent('syncUser', async (data) => {
      addAccount({
        userId: data.userId,
        username: data.username,
        nickname: data.nickname,
        bio: data.bio,
      });
    });


    // connect to websocket
    (async function() {
      await service.connect();
    })();

    return () => {
      service.close();
    };
  }, [service, addAccount, setConnectionStatus, setScreen, selectMainAccount]);
}

export function useWebSocketEvent<T extends keyof WebsocketEvents>(
  eventName: T,
  handler: (data: WebsocketEvents[T]) => void,
) {
  const socket = useWebsocketLifecycleServiceStore((state) => state.service);

  useEffect(() => {
    if (!socket) return;
    socket.registerEvent(eventName, handler);

    return () => {
      socket.unregisterEvent(eventName, handler);
    };
  }, [eventName, handler, socket]);
}

export const useWebsocketLifecycleService = () => {
  return useWebsocketLifecycleServiceStore(s => s.service);
};