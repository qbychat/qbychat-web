/*
 * Copyright (c) 2025. All rights reserved.
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

import 'react-virtualized/styles.css';
import useAppStore from '@/stores/app-store.ts';
import { useWebSocketLifecycleManager } from '@/hooks/websocket-lifecycle-service-hooks.ts';
import { AuthController } from '@/components/auth/AuthController.tsx';
import { OnboardingView } from '@/components/onboarding/OnboardingView.tsx';
import { MainLayout } from '@/components/main/MainLayout.tsx';
import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

export const App = () => {
  const screen = useAppStore(state => state.screen);
  const isDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });

  useEffect(() => {
    const classList = document.documentElement.classList;

    if (isDarkMode) {
      classList.add('dark', 'text-foreground', 'bg-background');
    } else {
      classList.remove('dark', 'text-foreground', 'bg-background');
    }

    return () => {
      classList.remove('dark', 'text-foreground', 'bg-background');
    };
  }, [isDarkMode]);

  useWebSocketLifecycleManager();

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <OnboardingView />;
      case 'auth':
        return <AuthController />;
      case 'main':
        return <MainLayout />;
    }
  };

  return (
    <div className="w-full h-screen m-0">
      {renderScreen()}
    </div>
  );
};
