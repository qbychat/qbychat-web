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

import { useAppStore } from '@/store/useAppStore.ts';
import SetupServerPage from '@/components/onboarding/SetupServerPage.tsx';
import backgroundImage from '@/assets/background.svg';
import { useWebSocketLifecycle } from '@/hooks/useWebSocketLifecycle.ts';
import LoadingAnimation from '@/components/LoadingAnimation.tsx';
import AuthController from '@/components/auth/AuthController.tsx';
import { isElectron } from '@/env.ts';

function App() {
  const screen = useAppStore(state => state.screen);

  useWebSocketLifecycle();

  const renderScreen = () => {
    switch (screen) {
      case 'loading':
        return <LoadingAnimation/>;
      case 'onboarding':
        // TODO use onboarding controller
        return <SetupServerPage/>;
      case 'auth':
        return <AuthController/>;
      case 'main':
        return <h1>main</h1>;
    }
  };

  if (isElectron) {
    // remove container for the desktop client
    return (
      <div className="w-full h-screen overflow-hidden m-0">
        {renderScreen()}
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden m-0" style={{ backgroundImage: `url("${backgroundImage}")` }}>
      {/*todo add settings for the border*/}
      <div
        className="sm:p-0 h-full lg:m-auto lg:scale-90 lg:rounded-3xl shadow-xl backdrop-blur-sm transition-all">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
