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


import DropdownMenu from '@/components/main/views/chat-list/DropdownMenu.tsx';
import ConnectionStateLabel from '@/components/ui/ConnectionStateLabel.tsx';

const ChatListView = () => {

  return (<div className="flex flex-col h-full">
    <div className="flex flex-row gap-2 p-2">
      <DropdownMenu />
      <ConnectionStateLabel text="QbyChat"/>
    </div>
    <div className="flex flex-col h-full p-2">
      <div>chat list</div>
    </div>
  </div>);
};

export default ChatListView;
