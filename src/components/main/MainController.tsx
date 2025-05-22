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
import { useEffect } from 'react';
import useMainRouterStore, { ViewEntry } from '@/store/controller/mainRouterStore.ts';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  useCurrentLeftDesktopViewEntry,
  useCurrentMobileViewEntry,
  useCurrentRightDesktopViewEntry, useRouterHistorySync,
  useStackControls,
} from '@/hooks/mainRouterHooks.ts';
import TransitionContainer from '@/components/main/TransitionContainer.tsx';

const MainController = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const { setMobile } = useMainRouterStore();

  const leftDesktopViewEntry = useCurrentLeftDesktopViewEntry();
  const rightDesktopViewEntry = useCurrentRightDesktopViewEntry();
  const currentMobileViewEntry = useCurrentMobileViewEntry();
  const { pushView, goBack } = useStackControls();

  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  useEffect(() => {
    pushView({ side: 'left', view: 'main' });
    pushView({ side: 'right', view: 'chat' });
    pushView({ side: 'right', view: 'settings' });
  }, [pushView]);

  useRouterHistorySync();

  function render(entry: ViewEntry | null) {
    if (!entry) {
      return <>Unable to render (entry is empty)</>;
    }
    switch (entry.view) {
      case 'main':
        return <>main
          <button onClick={() => pushView({ side: 'left', view: 'settings' })}>push settings</button>
          <button onClick={() => goBack()}>back</button>
        </>;
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
      render={render}
    />;
  }

  return (<PanelGroup autoSaveId="qbychat-main" direction="horizontal">
    <Panel defaultSize={25} maxSize={40} minSize={20}>
      <TransitionContainer
        currentViewEntry={leftDesktopViewEntry}
        render={render}
      />
    </Panel>
    <PanelResizeHandle />
    <Panel>
      <TransitionContainer
        currentViewEntry={rightDesktopViewEntry}
        render={render}
      />
    </Panel>
  </PanelGroup>);
};

export default MainController;