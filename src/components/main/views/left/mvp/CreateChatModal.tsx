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
import useWebsocketLifecycleServiceStore from '@/stores/websocketLifecycleServiceStore.ts';
import UserService from '@/websocket/services/UserService.ts';
import useAccountStore from '@/stores/accountStore.ts';
import { QueryUserResponse_Status } from '@/proto/qbychat/rpc/user/v1/user_service_pb';

const CreateChatModal = ({ opened, close }: { opened: boolean, close: () => void }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const service = useWebsocketLifecycleServiceStore(s => s.service);
  const mainAccountId = useAccountStore(s => s.mainAccountId);

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
    setError(`Ok ${profile.username} (${profile.userId?.localId?.content.value})`);
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
        onChange={(event) => setUsername(event.currentTarget.value)}
      />

      <Group mt="md">
        <Button onClick={handleCreateChat}>CREATE</Button>
      </Group>
    </Modal>
  );
};

export default CreateChatModal;
