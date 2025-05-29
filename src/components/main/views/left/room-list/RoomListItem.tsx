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

import { Avatar, Badge, Box, Group, Paper, Text } from '@mantine/core';
import { RoomModel } from '@/types/roomTypes.ts';
import useRoomStore from '@/stores/room/roomStore.ts';
import { useStackControls } from '@/hooks/mainRouterHooks.ts';

type Props = {
  room: RoomModel
}

const RoomListItem = ({ room }: Props) => {
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
    <Paper
      p="sm"
      withBorder={isSelected}
      onClick={navigateToChat}
      className="w-full cursor-pointer"
    >
      <Group align="flex-start" className="w-full">
        <Box className="relative w-16 flex-shrink-0">
          <Avatar size="lg" radius="xl" className="w-16 h-16 text-xl flex items-center justify-center">
            {getRoomName().slice(0, 2)}
          </Avatar>
          {/*{room.online && (*/}
          {/*  <Box*/}
          {/*    style={{*/}
          {/*      position: 'absolute',*/}
          {/*      bottom: 2,*/}
          {/*      right: 2,*/}
          {/*      width: 12,*/}
          {/*      height: 12,*/}
          {/*      backgroundColor: '#51cf66',*/}
          {/*      borderRadius: '50%',*/}
          {/*    }}*/}
          {/*  />*/}
          {/*)}*/}
        </Box>

        <Box className="flex flex-col flex-1 min-w-0">
          <Group justify="space-between" mb={4}>
            <Text fw={500} size="sm" truncate>
              {getRoomName()}
            </Text>
            <Text size="xs" c="dimmed" className="flex-shrink-0">
              TIME PLACEHOLDER
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed" truncate className="flex-1">
              {getLastMessage()}
            </Text>

            {room.unreadCount > 0 && (
              <Badge size="sm" variant="filled" color="red" style={{ minWidth: 20 }}>
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </Badge>
            )}
          </Group>
        </Box>
      </Group>
    </Paper>

  );
};

export default RoomListItem;