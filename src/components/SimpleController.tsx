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
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  pageMap: Record<string, React.ReactNode>,
  activePage: string
}

const SimpleController = ({ pageMap, activePage }: Props) => {
  const [activePageCache, setActivePageCache] = useState(activePage);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (activePage !== activePageCache) {
      setIsExiting(true);
      const timeout = setTimeout(() => {
        setActivePageCache(activePage);
        setIsExiting(false);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [activePage, activePageCache]);

  const Page = pageMap[activePageCache];

  return (
    <div style={{ position: 'relative' }} className="h-full">
      <AnimatePresence mode="wait">
        {!isExiting && activePageCache && (
          <motion.div
            key={activePageCache}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', height: '100%' }}
          >
            {Page}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleController;