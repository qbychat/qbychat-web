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

import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ViewEntry } from '@/store/controller/mainRouterStore.ts';
import { useIsBackDirection } from '@/hooks/mainRouterHooks.ts';
import React from 'react';

interface Props {
  currentViewEntry: ViewEntry | null;
  render: (entry: ViewEntry) => React.ReactNode;

  defaultElement?: React.ReactNode | null;
}

const TransitionContainer = ({
                               currentViewEntry,
                               render,
                               defaultElement,
                             }: Props) => {
  let isBack = useIsBackDirection();

  const variants: Variants = {
    initial: (custom: boolean) => ({
      x: custom ? '-40%' : '40%',
      opacity: 0,
      position: 'absolute',
      zIndex: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: 'relative',
      zIndex: 1,
    },
    exit: (custom: boolean) => ({
      x: custom ? '40%' : '-40%',
      opacity: 0,
      position: 'absolute',
      zIndex: 0,
    }),
  };

  // render element
  let element: React.ReactNode | null;
  if (currentViewEntry) {
    element = render(currentViewEntry);
  } else {
    isBack = true;
    element = defaultElement;
  }


  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} custom={isBack}>
        {element && (
          <motion.div
            key={currentViewEntry?.view ?? 'default'}
            className="absolute w-full h-full"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={isBack}
            transition={{ duration: 0.25 }}
          >
            {element}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransitionContainer;