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


import { DropdownMenu } from '@/components/main/views/left/DropdownMenu.tsx';
import { ConnectionStateLabel } from '@/components/ui/ConnectionStateLabel.tsx';
import { SearchBox } from '@/components/main/views/left/SearchBox.tsx';
import { ReactNode, useMemo, useState } from 'react';
import { SimpleViewContainer } from '@/components/SimpleViewContainer.tsx';
import { RoomList } from './room-list/RoomList.tsx';
import { useDisclosure } from '@mantine/hooks';
import { CreateChatModal } from '@/components/main/views/left/mvp/CreateChatModal.tsx';

type LeftPage = 'roomList' | 'search';

export const LeftPanel = () => {
  const [searchBoxContent, setSearchBoxContent] = useState('');
  const [searchBoxFocused, setSearchBoxFocused] = useState(false);
  // const [currentPage, setCurrentPage] = useState<LeftPage>('roomList');
  const [currentPage] = useState<LeftPage>('roomList');

  const [opened, { close, open }] = useDisclosure(false);


  const pageMap: Record<LeftPage, ReactNode> = useMemo(() => ({
    roomList: <RoomList />,
    search: <div>search</div>,
  }), []);

  return (
    <>
      <CreateChatModal opened={opened} close={close} />

      <div className="flex flex-col h-full" id="leftPanel">
        <div className="flex flex-row p-2 items-center">
          <DropdownMenu openPMModel={open} />
          <ConnectionStateLabel className="flex-1">
            <SearchBox value={searchBoxContent} onContentChange={setSearchBoxContent}
                       onFocusChange={(state) => setSearchBoxFocused(state)} />
          </ConnectionStateLabel>
        </div>
        <div className="flex flex-col h-full p-2">
          <SimpleViewContainer pageMap={pageMap}
                               activePage={(searchBoxFocused || searchBoxContent) ? 'search' : currentPage} />
        </div>
      </div>
    </>
  );
};
