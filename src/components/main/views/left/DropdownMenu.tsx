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

import { ActionIcon, Menu, rgba } from '@mantine/core';
import { ArchiveIcon, Contact2Icon, MenuIcon, PlusIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useStackControls } from '@/hooks/mainRouterHooks.ts';
import { useTranslation } from 'react-i18next';
import useAccountsStore from '@/store/accountsStore.ts';

const DropdownMenu = () => {
  const { t } = useTranslation();
  const { pushView } = useStackControls();

  const accounts = useAccountsStore(s => s.accounts);

  return (
    <Menu shadow="md" width={280} trapFocus transitionProps={{ transition: 'pop-top-left', duration: 200 }}
          styles={(theme) => ({
            dropdown: {
              border: 'none',
              backdropFilter: 'blur(12px)',
              backgroundColor: rgba(theme.colors.dark[7], 0.8),
            },
            label: {
              textAlign: 'center',
            },
          })}>
      <Menu.Target>
        <ActionIcon variant="transparent">
          <MenuIcon size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {Array.from(accounts.entries()).map(account => (
          <Menu.Item key={account[0]} leftSection={<UserIcon size={14}/>}>
          {account[1].nickname}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item leftSection={<PlusIcon size={14} />}>
          {t('menu.login')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<ArchiveIcon size={14} />}>
          {t('menu.saved-messages')}
        </Menu.Item>
        <Menu.Item leftSection={<Contact2Icon size={14} />}>
          {t('menu.contacts')}
        </Menu.Item>
        <Menu.Item leftSection={<SettingsIcon size={14} />} onClick={() => pushView({side: 'left', view: 'settings'})}>
          {t('menu.settings')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>QbyChat Web {__APP_VERSION__}</Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
};

export default DropdownMenu;