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
import { immer } from 'zustand/middleware/immer';

interface Account {
  userId: string;
  username: string;
  nickname: string;
  bio?: string | null;
}

interface AccountState {
  accounts: Record<string, Account>;
  addAccount: (account: Account) => void;
  removeAccount: (userId: string) => void;
  updateAccount: (userId: string, data: Partial<Account>) => void;
}

export const useAccountsStore = create<AccountState>()(
  immer((set) => ({
    accounts: {},

    addAccount: (account) =>
      set((state) => {
        state.accounts[account.userId] = account;
      }),

    removeAccount: (userId) =>
      set((state) => {
        delete state.accounts[userId];
      }),

    updateAccount: (userId, data) =>
      set((state) => {
        if (state.accounts[userId]) {
          Object.assign(state.accounts[userId], data);
        }
      }),
  })),
);

export default useAccountsStore;