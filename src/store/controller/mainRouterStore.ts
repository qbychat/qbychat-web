/*
 *  Copyright (c) 2025. All rights reserved.
 *  This file is a part of the QbyChat project
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';

type ViewSide = 'left' | 'right'
type ViewEntry = { side: ViewSide; view: string }

interface RouterState {
  isMobile: boolean;

  stack: ViewEntry[];

  // Views for Mobile UI
  view: string | null;
  previousView: string | null;

  // Views for desktop UI
  leftView: string | null;
  previousLeftView: string | null;
  rightView: string | null;
  previousRightView: string | null;

  pushView: (entry: ViewEntry, options?: { replace?: boolean }) => void;
  popView: (side: ViewSide) => void;
  goBack: () => void;
  updateViews: () => void;

  syncFromHistory: () => void;

  setMobile: (isMobile: boolean) => void;
}

export const useMainRouterStore = create<RouterState>((set, get) => ({
  isMobile: false,

  stack: [],

  view: null,
  previousView: null,

  leftView: null,
  previousLeftView: null,
  rightView: null,
  previousRightView: null,

  pushView: (entry, options = {}) => {
    const { stack } = get();
    const newStack = options.replace ? [...stack.slice(0, -1), entry] : [...stack, entry];

    window.history.pushState(newStack, ''); // Push to browser history

    set({ stack: newStack }, false);
    get().updateViews();
  },

  popView: (side: ViewSide) => {
    const stack = get().stack;
    const idx = [...stack].reverse().findIndex(entry => entry.side === side);

    if (idx === -1) return;

    const removeIndex = stack.length - 1 - idx;
    const newStack = [...stack.slice(0, removeIndex), ...stack.slice(removeIndex + 1)];

    window.history.pushState(newStack, '');
    set({ stack: newStack });
    get().updateViews();
  },

  goBack: () => {
    const { stack } = get();
    if (stack.length <= 1) return;

    const newStack = stack.slice(0, -1);
    window.history.pushState(newStack, ''); // Update browser history

    set({ stack: newStack }, false);
    get().updateViews();
  },

  updateViews: () => {
    const { stack, isMobile } = get();

    if (isMobile) {
      const previous = stack[stack.length - 2]?.view ?? null;
      const current = stack[stack.length - 1]?.view ?? null;

      set({
        view: current,
        previousView: previous,
        leftView: null,
        rightView: null,
        previousLeftView: null,
        previousRightView: null,
      });
      return;
    }

    // Only update for desktop
    const leftEntries = stack.filter((e) => e.side === 'left');
    const rightEntries = stack.filter((e) => e.side === 'right');

    set({
      leftView: leftEntries[leftEntries.length - 1]?.view ?? null,
      previousLeftView: leftEntries[leftEntries.length - 2]?.view ?? null,
      rightView: rightEntries[rightEntries.length - 1]?.view ?? null,
      previousRightView: rightEntries[rightEntries.length - 2]?.view ?? null,
      view: null,
      previousView: null,
    });
  },

  syncFromHistory: () => {
    const state = window.history.state;
    if (Array.isArray(state)) {
      set({ stack: state });
      get().updateViews();
    }
  },

  setMobile: (isMobile) => {
    set({ isMobile: isMobile });
    get().updateViews();
  },
}));

export default useMainRouterStore;

