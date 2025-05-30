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

import { Button, Group, Modal, TextInput } from '@mantine/core';
import { User2Icon } from 'lucide-react';
import { useState } from 'react';
import useWebsocketLifecycleServiceStore from '@/stores/websocket-lifecycle-service-store.ts';
import UserService from '@/websocket/services/user.service.ts';
import useAccountStore from '@/stores/account-store.ts';
import { QueryUserResponse_Status } from '@/proto/qbychat/rpc/user/v1/user_service_pb';
import { parseProtobufLocalId } from '@/utils/proto-utils.ts';
import { useStackControls } from '@/hooks/main-router-hooks.ts';
import { convertPublicUserProfileV1 } from '@/mappers/user-mapper.ts';

export const CreateChatModal = ({ opened, close }: { opened: boolean, close: () => void }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const service = useWebsocketLifecycleServiceStore(s => s.service);
  const mainAccountId = useAccountStore(s => s.mainAccountId);

  const { pushView } = useStackControls();

  const handleCreateChat = async () => {
    setError('');
    if (!service) {
      setError('Websocket RPC is not available');
    }
    if (!username) {
      setError('Username cannot be empty');
      return;
    }
    // TODO find user than open ChatView
    const userService = service?.getService(UserService);
    if (!userService) {
      setError('No userService available');
      return;
    }

    // TODO parse domain from input
    const response = await userService.queryUserByUsername(mainAccountId!, username);
    switch (response.status) {
      case QueryUserResponse_Status.USER_NOT_FOUND:
        setError('User Not Found');
        return;
    }
    const profile = response.userProfile!;
    const targetId = parseProtobufLocalId(profile.userId?.localId);
    if (targetId === mainAccountId) {
      setError('You cannot message yourself');
      return;
    }
    // push chat page
    pushView({
      side: 'right',
      view: 'chat',
      params: {
        peerUser: convertPublicUserProfileV1(profile),
      },
    });
    // close modal
    close();
  };

  return (
    <Modal opened={opened} onClose={close} title="Create PM" centered>
      <TextInput
        leftSectionPointerEvents="none"
        leftSection={<User2Icon size="15" />}
        label="Peer Username"
        description="Enter your friend's username to open the chat view"
        placeholder="Username"
        withAsterisk
        error={error}
        value={username}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            await handleCreateChat();
          }
        }}
        onChange={(event) => setUsername(event.currentTarget.value)}
      />

      <Group mt="md">
        <Button onClick={handleCreateChat}>CREATE</Button>
      </Group>
    </Modal>
  );
};
