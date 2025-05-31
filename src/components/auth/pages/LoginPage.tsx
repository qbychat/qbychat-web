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

import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/auth/AuthLayout.tsx';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/router/auth-router-store.ts';
import { useWebsocketLifecycleService } from '@/hooks/websocket-lifecycle-service-hooks.ts';
import { UsernamePasswordLoginResponse_Status } from '@/proto/qbychat/rpc/auth/v1/auth_service_pb';
import AuthService from '@/websocket/services/auth.service.ts';
import { RpcError } from '@/websocket/errors/rpc-error.ts';
import { Button, Input, Spacer } from '@heroui/react';
import { Form } from '@heroui/form';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useAuthStore((state) => state.navigate);
  const websocketLifecycleService = useWebsocketLifecycleService();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const loginSchema = z.object({
    username: z
      .string()
      .min(5, t('auth.error.username-length'))
      .max(16, t('auth.error.username-length')),
    password: z.string().min(1, t('auth.error.password-required')),
  });

  async function handleRequest(data: FormData) {
    if (!websocketLifecycleService) return;

    const result = loginSchema.safeParse(Object.fromEntries(data));
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const authService = websocketLifecycleService.getService(AuthService);
    const { username, password } = result.data;

    try {
      const response = await authService.usernamePasswordLogin(username, password);

      switch (response.status) {
        case UsernamePasswordLoginResponse_Status.BAD_USERNAME_OR_PASSWORD:
          return {
            errors: {
              password: [t('auth.error.bad-credentials')],
            },
          };
        case UsernamePasswordLoginResponse_Status.USER_BANNED:
          return {
            errors: {
              username: [t('auth.error.user-banned')],
            },
          };
        case UsernamePasswordLoginResponse_Status.ALREADY_LOGGED_IN:
          return {
            errors: {
              username: [t('auth.error.already-logged-in')],
            },
          };
      }
    } catch (e) {
      if (e instanceof RpcError) {
        return {
          errors: {
            password: [t('auth.error.rpc', { error: e.message })],
          },
        };
      }
      return {
        errors: {
          password: [t('auth.error.unknown')],
        },
      };
    }
  }

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.tip')}>
      <Form className="mt-6 w-full space-y-4"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              return handleRequest(new FormData(e.currentTarget));
            }}
      >
        <Input
          name="username"
          label={t('auth.login.username')}
          variant="bordered"
          isRequired
          validate={(value) => {
            const result = loginSchema.shape.username.safeParse(value);
            return result.success ? true : result.error.errors[0].message;
          }}
          classNames={{
            input: 'text-sm',
            label: 'text-sm font-medium',
          }}
        />

        <Input
          name="password"
          label={t('auth.login.password')}
          variant="bordered"
          isRequired
          type={isPasswordVisible ? 'text' : 'password'}
          validate={(value) => {
            const result = loginSchema.shape.password.safeParse(value);
            return result.success ? true : result.error.errors[0].message;
          }}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={togglePasswordVisibility}
              aria-label="toggle password visibility"
            >
              {isPasswordVisible ? (
                <EyeOff className="text-2xl text-default-400 pointer-events-none" size={20} />
              ) : (
                <Eye className="text-2xl text-default-400 pointer-events-none" size={20} />
              )}
            </button>
          }
          classNames={{
            input: 'text-sm',
            label: 'text-sm font-medium',
          }}
        />

        <Spacer y={2} />

        <div className="flex flex-row justify-between gap-4">
          <Button
            type="button"
            variant="bordered"
            onPress={() => navigate('register')}
            className="flex-1"
          >
            {t('auth.login.go-to-register')}
          </Button>

          <Button type="submit" color="primary" className="flex-1">
            {t('auth.continue')}
          </Button>
        </div>
      </Form>
    </AuthLayout>
  );
};