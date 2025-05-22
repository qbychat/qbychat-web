/*
 * Copyright (c) 2025. All rights reserved.
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

import React, { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { db } from '@/db.ts';
import { useTranslation } from 'react-i18next';
import useSettings from '@/store/settingsStore.ts';
import useAppStore from '@/store/appStore.ts';
import useWebsocketLifecycleService from '@/store/websocketLifecycleServiceStore.ts';
import WebsocketLifecycleService from '@/websocket/WebsocketLifecycleService.ts';
import { Loader2 } from 'lucide-react';
import AnimatedErrorMessage from '@/components/AnimatedErrorMessage.tsx';

const SetupServerPage = () => {
  const { t } = useTranslation();
  const settings = useSettings();
  const setSocket = useWebsocketLifecycleService((state) => state.setService);
  const setScreen = useAppStore((state) => state.setScreen);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // create websocketService
      const service = new WebsocketLifecycleService(address, null);
      // test connect
      if (!await service.testConnection()) {
        setLoading(false);
        setError(t('onboarding.server.connection.error.ws'));
        return;
      }
      // register the socket
      const id = await db.remoteServer.add({
        url: address,
        authToken: null,
      });
      // trigger connect in App.tsx
      settings.setCurrentServerId(id);
      setSocket(service);
      setScreen('auth');
    } catch {
      setLoading(false);
      setError(t('onboarding.server.connection.error.discovery'));
    }
  };

  return (<div className="h-full w-full flex flex-col gap-1 items-center justify-center">
    <h1 className="text-3xl md:text-4xl lg:text-5xl">{t('onboarding.server')}</h1>
    <AnimatedErrorMessage error={error} />
    <form className="mt-5 flex w-full max-w-sm items-center space-x-2" onSubmit={onSubmit}>
      <Input type="url"
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             placeholder="https://cubewhy.org"
             required />
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="animate-spin" />}
        {t('onboarding.server.connect')}
      </Button>
    </form>
  </div>);
};

export default SetupServerPage;