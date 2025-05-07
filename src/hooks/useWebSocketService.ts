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


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentServerId } from '@/store/slices/settings-slice.ts';
import { connectServer } from '@/store/slices/websocket-slice.ts';
import { db } from '@/db.ts';

export const useWebSocketService = () => {
  const dispatch = useDispatch();
  const currentServerId = useSelector((state: RootState) => state.settings.currentServerId);
  const websocketService = useSelector((state: RootState) => state.websocket.service);

  useEffect(() => {
    db.websocketAddresses.toArray().then((list) => {
      if (list.length > 0 && currentServerId === null) {
        dispatch(setCurrentServerId(list[0].id!));
      }
    });
  }, [currentServerId, dispatch]);

  useEffect(() => {
    if (!currentServerId) return;

    db.websocketAddresses.get(currentServerId).then((server) => {
      if (!server) return;
      if (websocketService?.url !== server.url) {
        dispatch(connectServer(server.url));
      }
    });
  }, [currentServerId, websocketService, dispatch]);

  return websocketService;
};