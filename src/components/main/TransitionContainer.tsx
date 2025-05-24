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

import { ViewEntry } from '@/store/controller/mainRouterStore.ts';
import { useIsBackDirection } from '@/hooks/mainRouterHooks.ts';
import React, { useEffect, useState } from 'react';
import { Transition } from '@mantine/core';

type Props = {
  currentViewEntry: ViewEntry | null;
  render: (entry: ViewEntry) => React.ReactNode;
  duration?: number;

  defaultElement?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>

const TransitionContainer = ({
                               currentViewEntry,
                               render,
                               duration = 200,
                               defaultElement,
                               ...divProps
                             }: Props) => {
  let isBack = useIsBackDirection();

  const [transitioning, setTransitioning] = useState(false);
  const [renderedEntry, setRenderedEntry] = useState<ViewEntry | null>(currentViewEntry);
  const [renderedElement, setRenderedElement] = useState<React.ReactNode>(
    currentViewEntry ? render(currentViewEntry) : defaultElement,
  );

  if (currentViewEntry === null) {
    isBack = true;
  }

  useEffect(() => {
    if (currentViewEntry === renderedEntry) return;

    setTransitioning(true);

    // Replace content after animation finished
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
        {(styles) => (
          <div className={`w-full h-full absolute ${divClassName}`}
               style={{ ...styles, ...divStyle }} {...otherDivProps}>
            {renderedElement}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default TransitionContainer;