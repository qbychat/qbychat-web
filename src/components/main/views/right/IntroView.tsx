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

import { Center, Stack, Text, Title } from '@mantine/core';

export const IntroView = () => {
  return (
    <Center style={{ height: '100%', width: '100%' }}>
      <Stack align="center">
        <Title order={2}>Welcome to QbyChat</Title>
        <Text c="dimmed" ta="center" maw={360}>
          Select a chat to start messaging
        </Text>
      </Stack>
    </Center>
  );
};