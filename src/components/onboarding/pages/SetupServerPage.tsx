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

import { FormEvent, useState } from 'react';
import { db } from '@/db.ts';
import { useTranslation } from 'react-i18next';
import useSettings from '@/stores/settings-store.ts';
import useAppStore from '@/stores/app-store.ts';
import useWebsocketLifecycleServiceStore from '@/stores/websocket-lifecycle-service-store.ts';
import WebsocketLifecycleService from '@/websocket/websocket-lifecycle-service.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { Input, Button } from '@heroui/react';

export const SetupServerPage = () => {
  const { t } = useTranslation();
  const settings = useSettings();
  const setSocket = useWebsocketLifecycleServiceStore((state) => state.setService);
  const setScreen = useAppStore((state) => state.setScreen);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  return (
    <div className="h-full w-full flex flex-col gap-4 items-center justify-center px-4">
      <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-semibold">
        {t('onboarding.server')}
      </h1>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-message"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-red-500 mt-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        className="mt-5 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md"
        onSubmit={onSubmit}
      >
        <Input
          type="url"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="https://cubewhy.org"
          isRequired
          className="flex-1"
          radius="full"
        />

        <Button
          type="submit"
          color="primary"
          isLoading={loading}
          radius="full"
          className="w-full sm:w-auto"
        >
          {t('onboarding.server.connect')}
        </Button>
      </form>
    </div>
  );
};
