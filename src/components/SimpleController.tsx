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

import React, { useEffect, useState } from 'react';
import { MantineTransition, Transition } from '@mantine/core';

type Props = {
  pageMap: Record<string, React.ReactNode>,
  activePage: string
  transition?: MantineTransition;
  transitionDuration?: number
}

const SimpleController = ({
                            pageMap,
                            activePage,
                            transition = 'scale',
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

  return (
    <div className="relative h-full w-full">
      <Transition
        mounted={!isExiting && !!activePageCache}
        transition={transition}
        duration={transitionDuration}
        timingFunction="ease"
      >
        {(styles) => (
          <div style={{ ...styles, width: '100%', height: '100%' }}>
            {Page}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default SimpleController;