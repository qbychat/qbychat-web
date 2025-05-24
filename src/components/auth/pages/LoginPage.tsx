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

import { useAuthStore } from '@/store/controller/authRouterStore.ts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@/components/auth/AuthLayout.tsx';
import AnimatedErrorMessage from '@/components/AnimatedErrorMessage.tsx';
import useWebsocketLifecycleService from '@/store/websocketLifecycleServiceStore.ts';
import AuthService from '@/websocket/services/AuthService.ts';
import { UsernamePasswordLoginResponse_Status } from '@/proto/qbychat/websocket/auth/v1/service_pb';
import { RpcError } from '@/websocket/errors/RpcError.ts';
import { useForm } from '@mantine/form';
import { Button, PasswordInput, TextInput } from '@mantine/core';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useAuthStore((state) => state.navigate);
  const websocketLifecycleService = useWebsocketLifecycleService((state) => state.service);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) =>
        value.length < 5 || value.length > 16
          ? t('auth.error.username-length')
          : null,
      password: (value) => (value.length === 0 ? t('auth.error.password-required') : null),
    },
  });

  async function onSubmit(values: { username: string, password: string }) {
    if (!websocketLifecycleService) return;

    setLoading(true);
    setError('');

    const authService = websocketLifecycleService.getService(AuthService);

    try {
      const response = await authService.usernamePasswordLogin(values.username, values.password);

      switch (response.status) {
        case UsernamePasswordLoginResponse_Status.BAD_USERNAME_OR_PASSWORD:
          setError(t('auth.error.bad-credentials'));
          break;
        case UsernamePasswordLoginResponse_Status.USER_BANNED:
          setError(t('auth.error.user-banned'));
          break;
      }
    } catch (e) {
      if (e instanceof RpcError) {
        setError(t('auth.error.rpc', { error: e.message }));
      } else {
        setError(t('auth.error.unknown'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.tip')}>
      <form onSubmit={form.onSubmit(onSubmit)} className="mt-6 w-full space-y-3">
        <AnimatedErrorMessage error={error} />

        <TextInput
          label={t('auth.login.username')}
          {...form.getInputProps('username')}
        />

        <PasswordInput
          label={t('auth.login.password')}
          {...form.getInputProps('password')}
        />

        <div className="flex flex-row justify-between mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('register')}
            disabled={loading}
          >
            {t('auth.login.go-to-register')}
          </Button>
          <Button type="submit" loading={loading}>
            {t('auth.continue')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;