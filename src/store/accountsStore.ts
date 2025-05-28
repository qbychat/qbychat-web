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
import { IdType } from '@/utils/protoUtils.ts';

interface Account {
  userId: IdType;
  username: string;
  nickname: string;
  bio?: string | null;
}

interface AccountState {
  accounts: Map<IdType, Account>;
  addAccount: (account: Account) => void;
  removeAccount: (userId: IdType) => void;
  updateAccount: (userId: IdType, data: Partial<Account>) => void;
}

export const useAccountsStore = create<AccountState>()(
  immer((set) => ({
    accounts: new Map<IdType, Account>(),

    addAccount: (account) =>
      set((state) => {
        state.accounts.set(account.userId, account);
      }),

    removeAccount: (userId) =>
      set((state) => {
        state.accounts.delete(userId);
      }),

    updateAccount: (userId, data) =>
      set((state) => {
        const account = state.accounts.get(userId);

        if (account) {
          Object.assign(account, data);
          state.accounts.set(userId, account);
        }
      }),
  })),
);

export default useAccountsStore;