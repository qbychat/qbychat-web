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

import React, { useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { db } from '@/db.ts';
import { useDispatch } from 'react-redux';
import { setCurrentServerId } from '@/store/slices/settings-slice.ts';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SetupServerPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id = await db.websocketAddresses.add({
      url: address,
    });
    dispatch(setCurrentServerId(id));
    navigate('/');
  };

  return (<div className="h-screen w-full flex flex-col gap-1 items-center justify-center">
    <h1 className="text-3xl md:text-4xl lg:text-5xl">{t('onboarding.server')}</h1>
    <form className="mt-5 flex w-full max-w-sm items-center space-x-2" onSubmit={onSubmit}>
      <Input type="url"
             value={address}
             onChange={(e) => setAddress(e.target.value)}
             placeholder="ws://example.com/ws"
             required />
      <Button type="submit">Connect</Button>
    </form>
  </div>);
};

export default SetupServerPage;