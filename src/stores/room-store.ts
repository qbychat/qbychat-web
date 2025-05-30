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


import { create } from 'zustand/index';
import { immer } from 'zustand/middleware/immer';
import { RoomModel } from '@/types/room-types.ts';
import { FederationIdModel } from '@/types/id-types.ts';

interface RoomState {
  rooms: RoomModel[];
  selectedRoomId: FederationIdModel | null;

  addRoom: (room: RoomModel) => void;
  removeRoom: (userId: FederationIdModel) => void;
  updateRoom: (userId: FederationIdModel, data: Partial<RoomModel>) => void;

  selectRoom: (roomId: FederationIdModel) => void;
}

const useRoomStore = create<RoomState>()(
  immer((set) => ({
    rooms: [],
    selectedRoomId: null,

    addRoom: (room) =>
      set((state) => {
        state.rooms.push(room);
      }),

    removeRoom: (roomId) =>
      set((state) => {
        const index = state.rooms.findIndex(room => room.roomId === roomId);
        if (index !== -1) {
          state.rooms.splice(index, 1);
        }
      }),

    updateRoom: (roomId, data) =>
      set((state) => {
        const room = state.rooms.find(room => room.roomId === roomId);
        if (room) {
          Object.assign(room, data);
        }
      }),

    selectRoom: (roomId) => set((state) => {
      state.selectedRoomId = roomId;
    }),
  })),
);

export default useRoomStore;