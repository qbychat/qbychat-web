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

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/controller/useAuthStore.ts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout.tsx';
import AnimatedErrorMessage from '@/components/AnimatedErrorMessage.tsx';
import useWebsocketLifecycleService from '@/store/useWebsocketLifecycleService.ts';
import AuthService from '@/websocket/services/AuthService.ts';
import { UsernamePasswordLoginResponse_Status } from '@/proto/qbychat/websocket/auth/v1/service_pb';
import { RPCError } from '@/websocket/errors/RPCError.ts';

const LoginPage = () => {
  const { t } = useTranslation();

  const navigate = useAuthStore(state => state.navigate);
  const websocketLifecycleService = useWebsocketLifecycleService(state => state.service);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    username: z.string().min(5).max(16),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!websocketLifecycleService) return;
    // process login
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
      if (e instanceof RPCError) {
        setError(t('auth.error.rpc', { error: e.message }));
      } else {
        setError(t('auth.error.unknown'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (<AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.tip')}>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 w-full space-y-3">
        <AnimatedErrorMessage error={error} />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.login.username')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.login.password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row justify-between mt-5">
          <Button type="button" variant="secondary" onClick={() => navigate('register')}
                  disabled={loading}>{t('auth.login.go-to-register')}</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {t('auth.continue')}
          </Button>
        </div>
      </form>
    </Form>
  </AuthLayout>);
};

export default LoginPage;