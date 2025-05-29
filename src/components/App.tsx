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
import useAppStore from '@/stores/appStore.ts';
import { useWebSocketLifecycle } from '@/hooks/useWebSocketLifecycle.ts';
import AuthController from '@/components/auth/AuthController.tsx';
import OnboardingController from '@/components/onboarding/OnboardingController.tsx';
import MainController from '@/components/main/MainController.tsx';

function App() {
  const screen = useAppStore(state => state.screen);

  useWebSocketLifecycle();

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding':
        return <OnboardingController />;
      case 'auth':
        return <AuthController />;
      case 'main':
        return <MainController />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden m-0">
      {renderScreen()}
    </div>
  );
}

export default App;
