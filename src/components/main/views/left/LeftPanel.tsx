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


import DropdownMenu from '@/components/main/views/left/DropdownMenu.tsx';
import ConnectionStateLabel from '@/components/ui/ConnectionStateLabel.tsx';
import SearchBox from '@/components/main/views/left/SearchBox.tsx';
import React, { useMemo, useState } from 'react';
import SimpleController from '@/components/SimpleController.tsx';

type LeftPage = 'chatList' | 'search';

const LeftPanel = () => {
  const [searchBoxContent, setSearchBoxContent] = useState('');
  const [currentPage, setCurrentPage] = useState<LeftPage>('chatList');

  const pageMap: Record<LeftPage, React.ReactNode> = useMemo(() => ({
    chatList: <div>chatList</div>,
    search: <div>search</div>,
  }), []);

  return (<div className="flex flex-col h-full">
    <div className="flex flex-row p-2 items-center">
      <DropdownMenu />
      <ConnectionStateLabel className="flex-1">
        <SearchBox value={searchBoxContent} onContentChange={setSearchBoxContent}
                   onFocusChange={(state) => setCurrentPage(state ? 'search' : 'chatList')} />
      </ConnectionStateLabel>
    </div>
    <div className="flex flex-col h-full p-2">
      {/*TODO modify browser history after switch page*/}
      <SimpleController pageMap={pageMap} activePage={currentPage}/>
    </div>
  </div>);
};

export default LeftPanel;
