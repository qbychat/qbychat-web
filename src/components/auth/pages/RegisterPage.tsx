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

import { useAuthStore } from '@/store/useAuthStore.ts';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import useWebsocketLifecycleService from '@/store/useWebsocketLifecycleService.ts';
import UserService from '@/websocket/services/UserService.ts';
import AnimatedErrorMessage from '@/components/AnimatedErrorMessage.tsx';
import AuthLayout from '@/components/auth/AuthLayout.tsx';
import { RegisterAccountResponse_Status } from '@/proto/qbychat/websocket/user/v1/service_pb';
import { RPCError } from '@/websocket/errors/RPCError.ts';

const RegisterPage = () => {
  const { t } = useTranslation();

  const navigate = useAuthStore(state => state.navigateAuthPage);
  const websocketLifecycleService = useWebsocketLifecycleService(state => state.service);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formSchema = z.object({
    username: z.string().min(5).max(16),
    password: z.string(),
    passwordVerify: z.string(),
  }).refine((data) => data.password === data.passwordVerify, {
    path: ['passwordVerify'],
    message: 'Password didn\'t match',
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      passwordVerify: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!websocketLifecycleService) return;
    setLoading(true);
    setError('');
    try {
      const userService = websocketLifecycleService.getService(UserService);
      const response = await userService.registerAccount(values.username, values.password);
      switch (response.status) {
        case RegisterAccountResponse_Status.BAD_USERNAME:
          setError('Bad username');
          break;
        case RegisterAccountResponse_Status.USERNAME_EXISTS:
          setError('Username was taken');
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

  return (<AuthLayout title={t('auth.title')} subtitle={t('auth.register.tip')}>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 w-full space-y-3"
      >
        <AnimatedErrorMessage error={error}/>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.username')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordVerify"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.password.verify')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('login')}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {t('auth.register.go-to-login')}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="animate-spin mr-2"/>}
            {t('auth.continue')}
          </Button>
        </div>
      </form>
    </Form>
  </AuthLayout>);

};

export default RegisterPage;
