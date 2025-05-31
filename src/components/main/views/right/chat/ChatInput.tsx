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


import { KeyboardEvent, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';

export const ChatInput = ({ onSend }: { onSend: (msg: string) => void }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const isCursorAtEnd = selectionStart === value.length && selectionEnd === value.length;

      if (isCursorAtEnd) {
        event.preventDefault();
        handleSend();
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-row flex-nowrap justify-center items-center gap-4 p-2">
      <Textarea
        ref={textareaRef}
        placeholder="Type your message..."
        minRows={1}
        maxRows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button
        onSubmit={handleSend}
        size="lg"
        radius="full"
        aria-label="Send message"
      >
        <SendIcon style={{ width: 15, height: 15 }} />
      </Button>
    </div>
  );
};