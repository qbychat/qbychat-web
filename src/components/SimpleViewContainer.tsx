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

import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  pageMap: Record<string, ReactNode>,
  activePage: string
  transition?: 'slide-left' | 'slide-right' | 'fade';
  transitionDuration?: number
}

export const SimpleViewContainer = ({
                                      pageMap,
                                      activePage,
                                      transition = 'fade',
                                      transitionDuration = 200,
                                    }: Props) => {
  const [activePageCache, setActivePageCache] = useState(activePage);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (activePage !== activePageCache) {
      setIsExiting(true);
      const timeout = setTimeout(() => {
        setActivePageCache(activePage);
        setIsExiting(false);
      }, transitionDuration);

      return () => clearTimeout(timeout);
    }
  }, [activePage, activePageCache, transitionDuration]);

  const Page = pageMap[activePageCache];

  const getVariants = () => {
    switch (transition) {
      case 'slide-left':
        return {
          initial: { opacity: 0, x: 30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -30 },
        };
      case 'slide-right':
        return {
          initial: { opacity: 0, x: -30 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 30 },
        };
      default: // "fade"
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        {!isExiting && activePageCache && (
          <motion.div
            key="page"
            className="absolute w-full h-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: transitionDuration / 1000, ease: 'easeInOut' }}
          >
            {Page}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
