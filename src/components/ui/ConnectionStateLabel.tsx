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

import { ReactNode, useEffect, useMemo, useState } from 'react';
import useAppStore from '@/stores/app-store.ts';
import { WebSocketStatus } from '@/types/websocket/connection.ts';
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';

type Props = {
  children?: ReactNode;
} & Omit<HTMLMotionProps<'div'>, 'ref'>

export const ConnectionStateLabel = ({ children, ...props }: Props) => {
  const { connectionStatus } = useAppStore();

  const statusMap: Record<WebSocketStatus, {
    label?: string | ReactNode;
    color: string;
    icon?: ReactNode;
    hidden?: boolean;
    animDots?: boolean
  }> = useMemo(() => ({
    connecting: {
      label: 'Connecting',
      color: 'yellow',
      animDots: true,
    },
    authenticating: {
      label: 'Authenticating',
      color: 'yellow',
      animDots: true,
    },
    open: {
      label: children,
      hidden: !children,
      color: 'white',
      animDots: false,
    },
    waiting: {
      label: 'Reconnecting',
      color: 'orange',
      animDots: true,
    },
    updating: {
      label: 'Updating',
      color: 'blue',
      animDots: true,
    },
    closed: {
      label: 'Disconnected',
      color: 'red',
      animDots: false,
    },
  }), [children]);

  const { animDots } = statusMap[connectionStatus];

  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (!animDots) {
      setDots(0);
      return;
    }
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, [animDots]);

  const [mounted, setMounted] = useState(true);
  const [prevStatus, setPrevStatus] = useState(connectionStatus);

  useEffect(() => {
    if (connectionStatus !== prevStatus) {
      setMounted(false);
      const timeout = setTimeout(() => {
        setPrevStatus(connectionStatus);
        setMounted(true);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [connectionStatus, prevStatus]);

  const current = statusMap[prevStatus];

  const { style: pStyle, ...otherProps } = props;

  return (
    <AnimatePresence mode="wait">
      {mounted && (
        <motion.div
          key="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: current.color,
            ...pStyle,
          }}
          {...otherProps}
        >
          {current.icon && <span>{current.icon}</span>}
            <span className="w-full">
            {current.label}
              {current.animDots ? '.'.repeat(dots) : ''}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
