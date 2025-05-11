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

import { AppScreen, useAppStore } from '@/store/useAppStore.ts';
import SetupServerPage from '@/components/onboarding/pages/SetupServerPage.tsx';
import backgroundImage from '@/assets/background.svg';
import useWebSocket from '@/store/useWebSocket.ts';
import { useEffect } from 'react';

function App() {
  const currentScreen = useAppStore((state) => state.screen);
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;
    socket.connect();

    return () => {
      socket.close();
    };
  }, [socket]);

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.setup:
        return <SetupServerPage/>;
      case AppScreen.auth:
        return <h1>auth</h1>;
      case AppScreen.main:
        return <h1>main</h1>;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden m-0" style={{ backgroundImage: `url("${backgroundImage}")` }}>
      {/*todo add settings for the border*/}
      <div
        className="sm:p-0 h-full lg:m-auto lg:scale-90 lg:rounded-3xl shadow-xl backdrop-blur-sm">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
