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

import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '@/store';
import { ReactNode } from 'react';

export const RequireOnboarding = ({ children }: { children: ReactNode }) => {
  const currentServer = useSelector((state: RootState) => state.settings.currentServerId);
  const location = useLocation();

  if (currentServer && location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

