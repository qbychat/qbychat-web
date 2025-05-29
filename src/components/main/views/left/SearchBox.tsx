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

import { SearchIcon } from 'lucide-react';
import { CloseButton, TextInput, Transition } from '@mantine/core';

type Props = {
  value: string;
  onContentChange: (value: string) => void;
  onFocusChange?: (value: boolean) => void;
}

const SearchBox = ({ value, onContentChange, onFocusChange }: Props) => {
  return (
    <TextInput
      radius="xl" className="mx-2"
      placeholder="Search"
      value={value}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
      onChange={(e) => onContentChange(e.target.value)}
      rightSectionPointerEvents="all"
      leftSection={<SearchIcon size={20} />}
      rightSection={
        <Transition
          mounted={!!value}
          transition="slide-left"
          duration={200}
          timingFunction="ease"
        >
          {(styles) =>
            <CloseButton
              aria-label="Clear search box"
              variant="transparent"
              onClick={() => onContentChange('')}
              style={styles}
            />
          }
        </Transition>
      }
    />
  );
};

export default SearchBox;
