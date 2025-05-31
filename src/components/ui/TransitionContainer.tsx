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

import { ViewEntry } from '@/stores/router/main-router-store.ts';
import { HTMLAttributes, memo, ReactNode, useEffect, useState } from 'react';
import { useIsBackDirection } from '@/hooks/main-router-hooks.ts';
import { AnimatePresence, motion, Variants } from 'framer-motion';

type Props = {
  currentViewEntry: ViewEntry | null;
  render: (entry: ViewEntry) => ReactNode;
  duration?: number;

  defaultElement?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const isSameViewEntry = (a: ViewEntry | null, b: ViewEntry | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.side === b.side && a.cacheKey === b.cacheKey;
};

export const TransitionContainer = memo(({
                                           currentViewEntry,
                                           render,
                                           duration = 200,
                                           defaultElement,
                                           ...divProps
                                         }: Props) => {
  const isBack = useIsBackDirection();

  const [transitioning, setTransitioning] = useState(false);
  const [renderedEntry, setRenderedEntry] = useState<ViewEntry | null>(currentViewEntry);
  const [renderedElement, setRenderedElement] = useState<ReactNode>(
    currentViewEntry ? render(currentViewEntry) : defaultElement,
  );

  useEffect(() => {
    if (isSameViewEntry(currentViewEntry, renderedEntry)) {
      // just update params
      setTransitioning(false);
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

  const variants: Variants = {
    initial: {
      opacity: 0,
      x: isBack ? -40 : 40,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: duration / 1000, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: isBack ? 40 : -40,
      transition: { duration: duration / 1000, ease: 'easeIn' },
    },
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${divClassName}`} {...otherDivProps}>
      <AnimatePresence mode="wait">
        {!transitioning && (
          <motion.div
            key="page"
            className="absolute w-full h-full"
            style={divStyle}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}

          >
            {renderedElement}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prevProps, nextProps) => {
  return isSameViewEntry(prevProps.currentViewEntry, nextProps.currentViewEntry);
});