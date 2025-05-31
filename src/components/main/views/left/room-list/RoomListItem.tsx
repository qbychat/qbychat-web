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

import { RoomModel } from '@/types/room-types.ts';
import useRoomStore from '@/stores/room-store.ts';
import { useStackControls } from '@/hooks/main-router-hooks.ts';
import { Avatar, Card, CardBody, cn } from '@heroui/react';
import { Badge } from '@heroui/badge';

type Props = {
  room: RoomModel
}

export const RoomListItem = ({ room }: Props) => {
  const selectedRoom = useRoomStore(s => s.selectedRoomId);
  const { pushView } = useStackControls();

  const isSelected = selectedRoom?.domain === room.roomId.domain && selectedRoom?.localId === room.roomId.localId;

  const getRoomName = () => {
    if (room.type === 'private') return room.metadata.peerUser.nickname || room.metadata.peerUser.username;
    if (room.type === 'group') return room.metadata.displayName;
    if (room.type === 'channel') return room.metadata.displayName;
    return 'Unknown';
  };

  const getLastMessage = () => {
    return room.lastMessage.content || '';
  };

  const navigateToChat = () => {
    if (isSelected) return;
    pushView({ side: 'right', view: 'chat', params: { roomId: room.roomId } }, { replace: true });
  };

  return (
    <Card
      shadow="sm"
      isPressable
      isHoverable
      onPress={navigateToChat}
      className={cn(
        'w-full cursor-pointer transition-all',
        isSelected && 'border border-primary',
      )}
    >
      <CardBody className="flex gap-4 p-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Avatar
            name={getRoomName().slice(0, 2)}
            size="lg"
            radius="full"
            className="w-16 h-16 text-xl flex items-center justify-center"
          />

          {/* 在线状态小圆点 */}
          {/* {room.online && (
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full" />
          )} */}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between mb-1">
            <label className="font-semibold truncate">
              {getRoomName()}
            </label>
            <label className="flex-shrink-0">
              TIME PLACEHOLDER
            </label>
          </div>

          <div className="flex justify-between items-center">
            <label className="truncate flex-1 text-default-500">
              {getLastMessage()}
            </label>

            {room.unreadCount > 0 && (
              <Badge color="danger" variant="solid" className="min-w-[20px] ml-2">
                999+
              </Badge>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};