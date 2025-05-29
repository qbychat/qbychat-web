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

import { ViewEntry } from '@/stores/controller/mainRouterStore.ts';
import React, { useEffect, useState } from 'react';
import { Transition } from '@mantine/core';
import { useIsBackDirection } from '@/hooks/mainRouterHooks.ts';

type Props = {
  currentViewEntry: ViewEntry | null;
  render: (entry: ViewEntry) => React.ReactNode;
  duration?: number;

  defaultElement?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const isSameViewEntry = (a: ViewEntry | null, b: ViewEntry | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.side === b.side && a.cacheKey === b.cacheKey;
};

const TransitionContainer = React.memo(({
                                          currentViewEntry,
                                          render,
                                          duration = 200,
                                          defaultElement,
                                          ...divProps
                                        }: Props) => {
  const isBack = useIsBackDirection();

  const [transitioning, setTransitioning] = useState(false);
  const [renderedEntry, setRenderedEntry] = useState<ViewEntry | null>(currentViewEntry);
  const [renderedElement, setRenderedElement] = useState<React.ReactNode>(
    currentViewEntry ? render(currentViewEntry) : defaultElement,
  );

  useEffect(() => {
    if (isSameViewEntry(currentViewEntry, renderedEntry)) {
      // just update params
      return;
    }

    setTransitioning(true);

    const timeout = setTimeout(() => {
      setRenderedEntry(currentViewEntry);
      setRenderedElement(currentViewEntry ? render(currentViewEntry) : defaultElement);
      setTransitioning(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentViewEntry, defaultElement, duration, render, renderedEntry]);

  const {
    className: divClassName = '',
    style: divStyle = {},
    ...otherDivProps
  } = divProps;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Transition
        mounted={!transitioning}
        transition={isBack ? 'fade-right' : 'fade-left'}
        duration={duration}
        timingFunction="ease-out"
      >
        {styles =>
          <div
            className={`w-full h-full absolute ${divClassName}`}
            style={{ ...divStyle, ...styles }}
            {...otherDivProps}
          >
            {renderedElement}
          </div>
        }
      </Transition>
    </div>
  );
}, (prevProps, nextProps) => {
  return isSameViewEntry(prevProps.currentViewEntry, nextProps.currentViewEntry);
});

export default TransitionContainer;