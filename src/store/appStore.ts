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

// store.ts
import { create } from 'zustand';
import { WebSocketStatus } from '@/websocket/types.ts';

export type AppScreen = 'onboarding' | 'auth' | 'main'

interface AppState {
  screen: AppScreen;
  prevScreen: AppScreen | null;
  connectionStatus: WebSocketStatus;

  // actions
  setScreen: (screen: AppScreen) => void;
  setConnectionStatus: (connectionStatus: WebSocketStatus) => void;
}

const useAppStore = create<AppState>((set, get) => ({
  screen: 'main',
  prevScreen: null,
  connectionStatus: 'connecting',

  setScreen: (newScreen) => {
    const { screen } = get();
    if (newScreen !== screen) {
      set({ prevScreen: screen, screen: newScreen });
    }
  },
  setConnectionStatus: (connectionStatus: WebSocketStatus) => {
    set({ connectionStatus });
  }
}));

export default useAppStore;