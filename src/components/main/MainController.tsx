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

import { useMediaQuery } from 'react-responsive';
import { useEffect, useMemo } from 'react';
import useMainRouterStore, { ViewEntry } from '@/store/controller/mainRouterStore.ts';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  useCurrentLeftDesktopViewEntry,
  useCurrentMobileViewEntry,
  useCurrentRightDesktopViewEntry,
  useRouterHistorySync,
  useStackControls,
} from '@/hooks/mainRouterHooks.ts';
import TransitionContainer from '@/components/main/TransitionContainer.tsx';
import ChatListView from '@/components/main/views/chat-list/ChatListView.tsx';

const MainController = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const { setMobile } = useMainRouterStore();

  const leftDesktopViewEntry = useCurrentLeftDesktopViewEntry();
  const rightDesktopViewEntry = useCurrentRightDesktopViewEntry();
  const currentMobileViewEntry = useCurrentMobileViewEntry();
  const { goBack } = useStackControls();

  const chatListViewCache = useMemo(() => {
    return <ChatListView/>;
  }, []);

  const introViewCache = useMemo(() => {
    return <>intro</>;
  }, []);

  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  useRouterHistorySync();

  function render(entry: ViewEntry | null) {
    if (!entry) {
      return <>Unable to render (entry is empty)</>;
    }
    switch (entry.view) {
      case 'settings':
        return <>settings
          <button onClick={() => goBack()}>back</button>
        </>;
      case 'chat':
        return <>
          chat (id: {entry.params?.chatId})
          <button onClick={() => goBack()}>back</button>
        </>;
      default:
        return <>Unable to render (unknown entry {entry.view})</>;
    }
  }

  if (isMobile) {
    return <TransitionContainer
      currentViewEntry={currentMobileViewEntry}
      defaultElement={chatListViewCache}
      render={render}
    />;
  }

  return (<PanelGroup autoSaveId="qbychat-main" direction="horizontal">
    <Panel defaultSize={25} maxSize={40} minSize={20}>
      <TransitionContainer
        currentViewEntry={leftDesktopViewEntry}
        render={render}
        defaultElement={chatListViewCache}
      />
    </Panel>
    <PanelResizeHandle className="w-2"/>
    <Panel>
      <TransitionContainer
        currentViewEntry={rightDesktopViewEntry}
        render={render}
        defaultElement={introViewCache}
      />
    </Panel>
  </PanelGroup>);
};

export default MainController;