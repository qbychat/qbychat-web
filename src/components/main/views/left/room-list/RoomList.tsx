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


import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import { RoomListItem } from '@/components/main/views/left/room-list/RoomListItem.tsx';
import { useRef } from 'react';
import { ListRowProps } from 'react-virtualized/dist/es/List';
import { RoomModel } from '@/types/room-types.ts';
import useRoomStore from '@/stores/room-store.ts';

export const RoomList = () => {
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 60,
    }),
  );

  const rooms: RoomModel[] = useRoomStore(s => s.rooms);

  function rowRenderer({ index, key, parent, style }: ListRowProps) {
    const room = rooms[index];
    return (
      <CellMeasurer
        cache={cache.current}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <div ref={registerChild} style={style} className="py-0.5">
            <RoomListItem key={room.roomId.toString()} room={room} />
          </div>
        )}
      </CellMeasurer>
    );
  }

  return (
    <AutoSizer className="h-full">
      {({ height, width }) => (
        <List
          height={height}
          rowCount={rooms.length}
          rowHeight={cache.current.rowHeight}
          deferredMeasurementCache={cache.current}
          overscanRowCount={3}
          rowRenderer={rowRenderer}
          width={width}
        />
      )}
    </AutoSizer>
  );
};