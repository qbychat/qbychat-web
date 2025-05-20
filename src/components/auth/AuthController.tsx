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

import { useAuthStore } from '@/store/controller/useAuthStore.ts';
import React, { useMemo } from 'react';
import LoginPage from '@/components/auth/pages/LoginPage.tsx';
import RegisterPage from '@/components/auth/pages/RegisterPage.tsx';
import SimpleController from '@/components/SimpleController.tsx';


const AuthController = () => {
  const pageMap = useMemo<Record<string, React.ReactNode>>(() => ({
    login: <LoginPage />,
    register: <RegisterPage />,
    qrcode: <>QR Code Login</>,
  }), []);


  const activePage = useAuthStore(state => state.page);

  return (<SimpleController pageMap={pageMap} activePage={activePage} />);
};

export default AuthController;