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
import useWebsocketLifecycleService from '@/store/websocketLifecycleServiceStore.ts';
import UserService from '@/websocket/services/UserService.ts';
import AnimatedErrorMessage from '@/components/AnimatedErrorMessage.tsx';
import AuthLayout from '@/components/auth/AuthLayout.tsx';
import { RpcError } from '@/websocket/errors/RpcError.ts';
import { useForm } from '@mantine/form';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { RegisterAccountResponse_Status } from '@/proto/qbychat/rpc/user/v1/user_service_pb';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useAuthStore((state) => state.navigate);
  const websocketLifecycleService = useWebsocketLifecycleService((state) => state.service);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      passwordVerify: '',
    },
    validate: {
      username: (value) => {
        const regex = /^[a-zA-Z0-9]{5,16}$/;
        if (!regex.test(value)) {
          return t('auth.error.username-invalid');
        }
        return null;
      },
      password: (value) => (value.length === 0 ? t('auth.error.password-required') : null),
      passwordVerify: (value, values) =>
        value !== values.password ? t('auth.error.password-mismatch') : null,
    },
  });

  async function onSubmit(values: { username: string, password: string }) {
    if (!websocketLifecycleService) return;

    setLoading(true);
    setError('');

    try {
      const userService = websocketLifecycleService.getService(UserService);
      const response = await userService.registerAccount(values.username, values.password);

      switch (response.status) {
        case RegisterAccountResponse_Status.BAD_USERNAME:
          setError(t('auth.error.bad-username'));
          break;
        case RegisterAccountResponse_Status.USERNAME_EXISTS:
          setError(t('auth.error.username-taken'));
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
    <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.tip')}>
      <form onSubmit={form.onSubmit(onSubmit)} className="mt-6 w-full space-y-3">
        <AnimatedErrorMessage error={error} />

        <TextInput
          label={t('auth.register.username')}
          {...form.getInputProps('username')}
        />

        <PasswordInput
          label={t('auth.register.password')}
          {...form.getInputProps('password')}
        />

        <PasswordInput
          label={t('auth.register.password.verify')}
          {...form.getInputProps('passwordVerify')}
        />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('login')}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t('auth.register.go-to-login')}
          </Button>
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            {t('auth.continue')}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
