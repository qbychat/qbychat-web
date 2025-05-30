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

import { useViewParams } from '@/hooks/main-router-hooks.ts';
import { useEffect, useState } from 'react';
import log from 'loglevel';
import { ActionIcon, Alert, Avatar, Button, Container, Group, Stack, Text } from '@mantine/core';
import { AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';

export const ChatView = () => {
  const { params } = useViewParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params?.roomId) {
      if (!params?.peerUser) {
        log.error('❌ Failed to load chat (neither roomId or peerUser value provided)');
        setError('Neither roomId or peerUser is provided (please report this to developer)');
      }
    }
    // TODO load room or peerUser
  }, [params]);

  if (error) {
    return (
      <Container size="sm" mt="xl">
        <Alert icon={<AlertCircleIcon size={20} />} title="Error" color="red" variant="filled">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Group justify="space-between" px="md" py="sm" style={{ borderBottom: '1px solid #393939' }}>
      <Group>
        <ActionIcon variant="subtle" radius="xl" aria-label="Back">
          <ArrowLeftIcon size={20} />
        </ActionIcon>

        <Group gap="sm" align="center">
          <Avatar size="md" radius="xl">
            {params?.peerUser?.nickname.slice(0, 1).toUpperCase()}
          </Avatar>
          <Stack gap={0}>
            <Text fw={500}>{params?.peerUser?.nickname}</Text>
            <Text size="sm" c="blue">Online</Text>
          </Stack>
        </Group>
      </Group>

      <Button variant="default">ACTIONS</Button>
    </Group>
  );
};
