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

import { useStackControls } from '@/hooks/main-router-hooks.ts';
import { useTranslation } from 'react-i18next';
import useAccountStore from '@/stores/account-store.ts';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@heroui/react';
import { ArchiveIcon, Contact2Icon, MailIcon, MenuIcon, PlusIcon, SettingsIcon, UserIcon } from 'lucide-react';

type Props = {
  openPMModel: () => void;
}

export const DropdownMenu1 = ({ openPMModel }: Props) => {
  const { t } = useTranslation();
  const { pushView } = useStackControls();

  const accounts = useAccountStore(s => s.accounts);

  return (
    <Dropdown
      placement="bottom-start"
      classNames={{
        content: 'min-w-[280px]',
      }}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="light"
          aria-label="Menu"
        >
          <MenuIcon size={20} />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="User menu"
        variant="bordered"
      >
        <DropdownSection title="Accounts" showDivider>
          {Array.from(accounts.entries()).map(account => (
            <DropdownItem
              key={account[0].toString()}
              startContent={<UserIcon size={14} />}
              textValue={account[1].nickname}
            >
              {account[1].nickname}
            </DropdownItem>
          ))}
        </DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem
            key="login"
            startContent={<PlusIcon size={14} />}
            textValue={t('menu.login')}
          >
            {t('menu.login')}
          </DropdownItem>
        </DropdownSection>

        <DropdownSection showDivider>
          <DropdownItem
            key="start-pm"
            startContent={<MailIcon size={14} />}
            onPress={openPMModel}
          >
            Start PM
          </DropdownItem>
          <DropdownItem
            key="saved-messages"
            startContent={<ArchiveIcon size={14} />}
            textValue={t('menu.saved-messages')}
          >
            {t('menu.saved-messages')}
          </DropdownItem>
          <DropdownItem
            key="contacts"
            startContent={<Contact2Icon size={14} />}
          >
            {t('menu.contacts')}
          </DropdownItem>
          <DropdownItem
            key="settings"
            startContent={<SettingsIcon size={14} />}
            onPress={() => pushView({ side: 'left', view: 'settings' })}
            textValue={t('menu.settings')}
          >
            {t('menu.settings')}
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          <DropdownItem
            key="version"
            isReadOnly
            className="opacity-50"
            textValue={`QbyChat Web ${__APP_VERSION__}`}
          >
            QbyChat Web {__APP_VERSION__}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};