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

import { SearchIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@heroui/react';

type Props = {
  value: string;
  onContentChange: (value: string) => void;
  onFocusChange?: (value: boolean) => void;
}

export const SearchBox = ({ value, onContentChange, onFocusChange }: Props) => {
  return (
    <Input
      radius="full"
      placeholder="Search"
      size="sm"
      className="mx-2 pr-3"
      value={value}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
      onChange={(e) => onContentChange(e.target.value)}
      startContent={<SearchIcon size={18} className="text-default-400" />}
      endContent={
        <AnimatePresence>
          {value && (
            <motion.button
              key="clear-button"
              aria-label="Clear search box"
              onClick={() => onContentChange('')}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="text-default-400 hover:text-default-600"
            >
              <XIcon size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      }
    />
  );
};
