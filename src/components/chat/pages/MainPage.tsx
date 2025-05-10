/*
 * Copyright (c) 2025. All rights reserved.
 *
 * This file is a part of the QbyChat project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { useMediaQuery } from 'react-responsive';
import { ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

type Props = {
  left: ReactNode,
  middle: ReactNode | null,
  right: ReactNode,

  focus: 'left' | 'middle' | 'right'
}

const MainPage = ({ left, middle, right, focus = 'right' }: Props) => {
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' });

  if (isMobile) {
    switch (focus) {
      case 'left':
        return left;
      case 'middle':
        return middle || <div className="text-red-500">empty</div>;
      case 'right':
        return right;
      default:
        return null;
    }
  }

  return (<div className="h-screen w-full">
    <PanelGroup autoSaveId="qc-main-group" direction="horizontal" className="h-screen w-full">
      <Panel defaultSize={25} minSize={10} maxSize={middle ? 20 : 35}>
        {left}
      </Panel>
      <PanelResizeHandle />
      {middle && <>
        <Panel defaultSize={10} minSize={10} maxSize={15}>
          {middle}
        </Panel>
        <PanelResizeHandle />
      </>}
      <Panel>
        {right}
      </Panel>
    </PanelGroup>
  </div>);
};

export default MainPage;
