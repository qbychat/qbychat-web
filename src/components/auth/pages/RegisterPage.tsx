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

import { useAuthStore } from '@/stores/router/auth-router-store.ts';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWebsocketLifecycleServiceStore from '@/stores/websocket-lifecycle-service-store.ts';
import UserService from '@/websocket/services/user.service.ts';
import { AuthLayout } from '@/components/auth/AuthLayout.tsx';
import { RpcError } from '@/websocket/errors/rpc-error.ts';
import { RegisterAccountResponse_Status } from '@/proto/qbychat/rpc/user/v1/user_service_pb';
import { Input } from '@heroui/input';
import { Form } from '@heroui/form';
import { Eye, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Spacer } from '@heroui/react';
import { Button } from '@heroui/button';
import { z } from 'zod';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useAuthStore((state) => state.navigate);
  const websocketLifecycleService = useWebsocketLifecycleServiceStore((state) => state.service);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVerifyVisible, setIsPasswordVerifyVisible] = useState(false);

  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const togglePasswordVerifyVisibility = () => setIsPasswordVerifyVisible(!isPasswordVerifyVisible);

  const baseSchema = z.object({
    username: z
      .string()
      .min(5, t('auth.error.username-length'))
      .max(16, t('auth.error.username-length'))
      .regex(/^[a-zA-Z0-9]+$/, t('auth.error.username-invalid')),
    password: z.string().min(1, t('auth.error.password-required')),
    passwordVerify: z.string().min(1, t('auth.error.password-required')),
  });

  const schema = baseSchema.refine((data) => data.password === data.passwordVerify, {
    message: t('auth.error.password-mismatch'),
    path: ['passwordVerify'],
  });


  const handleRequest = async (data: FormData) => {
    if (!websocketLifecycleService) return {
      errors: ['Internal error'],
    };

    const result = schema.safeParse(Object.fromEntries(data));
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { username, password } = result.data;
    const userService = websocketLifecycleService.getService(UserService);

    try {
      const response = await userService.registerAccount(username, password);

      switch (response.status) {
        case RegisterAccountResponse_Status.BAD_USERNAME:
          return {
            errors: {
              username: [t('auth.error.bad-username')],
            },
          };
        case RegisterAccountResponse_Status.USERNAME_EXISTS:
          return {
            errors: {
              username: [t('auth.error.username-taken')],
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
    return {
      errors: {},
    };
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const result = await handleRequest(data);

    setErrors(result ?? {});
  };

  return (
    <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.tip')}>
      <Form className="mt-6 w-full space-y-4" onSubmit={onSubmit} validationErrors={errors}>
        <Input
          name="username"
          label={t('auth.register.username')}
          variant="bordered"
          isRequired
          // validate={(value) => {
          //   const result = baseSchema.shape.username.safeParse(value);
          //   return result.success ? true : result.error.essage;
          // }}
          classNames={{
            input: 'text-sm',
            label: 'text-sm font-medium',
          }}
        />

        <Input
          name="password"
          label={t('auth.register.password')}
          type={isPasswordVisible ? 'text' : 'password'}
          variant="bordered"
          isRequired
          // validate={(value) => {
          //   const result = baseSchema.shape.password.safeParse(value);
          //   return result.success ? true : result.error.message;
          // }}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={togglePasswordVisibility}
              aria-label="toggle password visibility"
            >
              {isPasswordVisible ? (
                <EyeOffIcon className="text-2xl text-default-400 pointer-events-none" size={20} />
              ) : (
                <EyeIcon className="text-2xl text-default-400 pointer-events-none" size={20} />
              )}
            </button>
          }
          classNames={{
            input: 'text-sm',
            label: 'text-sm font-medium',
          }}
        />

        <Input
          name="passwordVerify"
          label={t('auth.register.password.verify')}
          type={isPasswordVerifyVisible ? 'text' : 'password'}
          variant="bordered"
          isRequired
          // validate={(value) => {
          //   const result = baseSchema.shape.passwordVerify.safeParse(value);
          //   return result.success ? true : result.error.message;
          // }}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={togglePasswordVerifyVisibility}
              aria-label="toggle password verify visibility"
            >
              {isPasswordVerifyVisible ? (
                <EyeOffIcon className="text-2xl text-default-400 pointer-events-none" size={20} />
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
            onPress={() => navigate('login')}
            className="flex-1"
          >
            {t('auth.register.go-to-login')}
          </Button>

          <Button type="submit" color="primary" className="flex-1">
            {t('auth.continue')}
          </Button>
        </div>
      </Form>
    </AuthLayout>
  );
};