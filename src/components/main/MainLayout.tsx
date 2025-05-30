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
import { ReactNode, useEffect, useRef, useState } from 'react';
import useMainRouterStore, { ViewEntry } from '@/stores/router/main-router-store.ts';
import {
  useCurrentLeftDesktopViewEntry,
  useCurrentMobileViewEntry,
  useCurrentRightDesktopViewEntry,
  useRouterHistorySync,
  useStackControls,
} from '@/hooks/main-router-hooks.ts';
import { TransitionContainer } from '@/components/ui/TransitionContainer.tsx';
import { LeftPanel } from '@/components/main/views/left/LeftPanel.tsx';
import { usePrevious } from '@mantine/hooks';
import { ChatView } from '@/components/main/views/right/ChatView.tsx';
import { ViewProvider } from '@/components/router/ViewProvider.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { IntroView } from '@/components/main/views/right/IntroView.tsx';

export const MainLayout = () => {
  // Detects if the current screen width is mobile-sized (≤768px)
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Zustand stores for marking current layout as mobile or not
  const { setMobile } = useMainRouterStore();

  // Which stack is currently visible: left, right, or both
  const [visibleStack, setVisibleStack] = useState<'left' | 'right' | 'both'>('both');
  const visibleStackRef = useRef<'left' | 'right' | 'both'>(visibleStack); // ref to avoid stale closures

  // These hooks return the current view entry for each stack
  const leftDesktopViewEntry = useCurrentLeftDesktopViewEntry();
  const rightDesktopViewEntry = useCurrentRightDesktopViewEntry();
  const currentMobileViewEntry = useCurrentMobileViewEntry();

  // Provides back navigation for current stack
  const { goBack } = useStackControls();

  // Caches previous view entries (used for comparing view transitions)
  const previousLeftDesktopViewEntryCache = usePrevious(leftDesktopViewEntry);
  const previousRightDesktopViewEntryCache = usePrevious(rightDesktopViewEntry);

  // Internal state for currently rendered entries
  const [leftEntry, setLeftEntry] = useState<ViewEntry | null>(null);
  const [rightEntry, setRightEntry] = useState<ViewEntry | null>(null);

  // Syncs Zustand stack state with browser history (back/forward)
  useRouterHistorySync();

  // Update global layout state when screen size changes
  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  // Keep ref updated for logic that needs latest visibleStack without triggering re-renders
  useEffect(() => {
    visibleStackRef.current = visibleStack;
  }, [visibleStack]);

  // When current view or screen mode changes, update left/right stack render state
  useEffect(() => {
    if (!isMobile) {
      // On desktop, just sync current left/right views directly
      setVisibleStack('both');
      setLeftEntry(leftDesktopViewEntry);
      setRightEntry(rightDesktopViewEntry);
      return;
    }

    // On mobile, infer which stack (left/right) the current view belongs to
    if (previousLeftDesktopViewEntryCache?.view === currentMobileViewEntry?.view) {
      setLeftEntry(currentMobileViewEntry);
      setVisibleStack('left');
    } else if (previousRightDesktopViewEntryCache?.view === currentMobileViewEntry?.view) {
      setRightEntry(currentMobileViewEntry);
      setVisibleStack('right');
    } else {
      // If view is new, assign it to the currently visible stack
      if (visibleStackRef.current === 'left') {
        setLeftEntry(currentMobileViewEntry);
      } else if (visibleStackRef.current === 'right') {
        setRightEntry(currentMobileViewEntry);
      }
    }
  }, [
    currentMobileViewEntry,
    isMobile,
    leftDesktopViewEntry,
    previousLeftDesktopViewEntryCache,
    previousRightDesktopViewEntryCache,
    rightDesktopViewEntry,
  ]);

  // Renders content based on current ViewEntry
  function render(entry: ViewEntry | null) {
    if (!entry) {
      return <>Unable to render (entry is empty)</>;
    }

    let component: ReactNode;

    switch (entry.view) {
      case 'settings':
        component = <>settings <button onClick={() => goBack()}>back</button></>;
        break;
      case 'chat':
        component = <ChatView />;
        break;
      default:
        component = <>Unable to render (unknown entry {entry.view})</>;
        break;
    }

    return (
      <ViewProvider cacheKey={entry.cacheKey!}>
        {component}
      </ViewProvider>
    );
  }

  // return (
  //   <PanelGroup autoSaveId="qbychat-main" direction="horizontal">
  //     {/* Left Panel */}
  //     <AnimatePresence initial={false}>
  //       {(visibleStack === 'both' || visibleStack === 'left') && (
  //         <motion.div
  //           key="left"
  //           layout
  //           initial={{ flex: 0 }}
  //           animate={{ flex: visibleStack === 'both' ? 0.25 : 1 }}
  //           exit={{ flex: 0 }}
  //           transition={{ duration: 0.3, ease: 'easeInOut' }}
  //           style={{ display: 'flex', overflow: 'hidden' }}
  //         >
  //           <Panel maxSize={40} minSize={20}>
  //             <TransitionContainer
  //               currentViewEntry={leftEntry}
  //               render={render}
  //               defaultElement={<LeftPanel />}
  //             />
  //           </Panel>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //
  //     {/* Resize Handle */}
  //     {visibleStack === 'both' && (<PanelResizeHandle />)}
  //
  //     {/* Right Panel */}
  //     <AnimatePresence initial={false}>
  //       {(visibleStack === 'both' || visibleStack === 'right') && (
  //         <motion.div
  //           key="right"
  //           layout
  //           initial={{ flex: 0 }}
  //           animate={{ flex: visibleStack === 'both' ? 0.75 : 1 }}
  //           exit={{ flex: 0 }}
  //           transition={{ duration: 0.3, ease: 'easeInOut' }}
  //           style={{ display: 'flex', overflow: 'hidden' }}
  //         >
  //           <Panel>
  //             <TransitionContainer
  //               currentViewEntry={rightEntry}
  //               render={render}
  //               defaultElement={<>intro</>}
  //             />
  //           </Panel>
  //         </motion.div>
  //       )}
  //     </AnimatePresence>
  //   </PanelGroup>
  // );

  // Render two panels horizontally (desktop: both shown, mobile: only one shown)

  return (
    <PanelGroup autoSaveId="qbychat-main" direction="horizontal">
      {/* Left Panel */}
      <Panel defaultSize={25} maxSize={40} minSize={20} key="left" id="left-panel"
             className={(visibleStack === 'both'||visibleStack === 'left') ? '' : ' hidden'}
             aria-hidden={!(visibleStack === 'both'||visibleStack === 'left')}
      >
        <TransitionContainer
          currentViewEntry={leftEntry}
          render={render}
          defaultElement={<LeftPanel />}
        />
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className={visibleStack === 'both' ? 'border-r border-[#393939]' : 'hidden'} />

      {/* Right Panel */}

      <Panel key="right" id="right-panel"
             className={(visibleStack === 'both' || visibleStack === 'right') ? '' : 'hidden'} aria-hidden={!(visibleStack === 'both' || visibleStack === 'right')}>
        <TransitionContainer
          currentViewEntry={rightEntry}
          render={render}
          defaultElement={<IntroView />}
        />
      </Panel>
    </PanelGroup>
  );
};
