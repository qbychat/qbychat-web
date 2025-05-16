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
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import LoginPage from '@/components/auth/pages/LoginPage.tsx';
import RegisterPage from '@/components/auth/pages/RegisterPage.tsx';


const AuthController = () => {
  const pageMap = useMemo<Record<string, React.ReactNode>>(() => ({
    login: <LoginPage />,
    register: <RegisterPage />,
    qrcode: <>QR Code Login</>,
  }), []);


  const targetPage = useAuthStore(state => state.page);
  const [activePage, setActivePage] = useState(targetPage);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (targetPage !== activePage) {
      setIsExiting(true);
      const timeout = setTimeout(() => {
        setActivePage(targetPage);
        setIsExiting(false);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [targetPage, activePage]);

  const Page = pageMap[activePage];

  return (
    <div style={{ position: 'relative', minHeight: '300px' }}>
      <AnimatePresence mode="wait">
        {!isExiting && activePage && (
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%' }}
          >
            {Page}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthController;