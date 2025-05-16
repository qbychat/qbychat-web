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

const RegisterPage = () => {
  const { t } = useTranslation();

  const navigate = useAuthStore(state => state.navigateAuthPage);
  const [loading, setLoading] = useState(false);

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO register
    setLoading(true);
  }

  return (<div className="m-auto flex flex-col items-center justify-center pt-10 gap-1 w-1/5">
    <img src="/qbychat.svg" alt="QbyChat Logo" />
    <h1 className="text-2xl lg:text-3xl">{t('auth.title')}</h1>
    <p className="text-[#707579] dark:text-[#aaaaaa]">{t('auth.register.tip')}</p>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 w-full">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.username')}</FormLabel>
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
              <FormLabel>{t('auth.register.password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row justify-between mt-5">
          <Button type="button" variant="secondary" onClick={() => navigate('login')}
                  disabled={loading}>{t('auth.register.go-to-login')}</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {t('auth.continue')}
          </Button>
        </div>
      </form>
    </Form>
  </div>);
};

export default RegisterPage;
