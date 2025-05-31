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

import { useViewParams } from '@/hooks/main-router-hooks.ts';
import { useEffect, useState } from 'react';
import log from 'loglevel';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { ChatInput } from '@/components/main/views/right/chat/ChatInput.tsx';
import { ChatStartPrompt } from '@/components/main/views/right/chat/ChatStartPrompt.tsx';
import { Alert, Avatar, Button } from '@heroui/react';

export const ChatView = () => {
  const { params } = useViewParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params?.roomId) {
      if (!params?.peerUser) {
        log.error('❌ Failed to load chat (neither roomId or peerUser value provided)');
        setError('Neither roomId or peerUser is provided (please report this to developer)');
      }
    }
    // TODO load room or peerUser
  }, [params]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert
          color="danger"
          variant="solid"
          startContent={<AlertCircle size={20} />}
          title="Error"
        >
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="flex items-center gap-3">
            <Avatar
              size="md"
              radius="full"
              name={params?.peerUser?.nickname}
              getInitials={(name) => name.slice(0, 1).toUpperCase()}
            />
            <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {params?.peerUser?.nickname}
            </span>
              <span className="text-sm text-primary">Online</span>
            </div>
          </div>
        </div>

        <Button variant="bordered">
          ACTIONS
        </Button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {params?.roomId ? '' : <ChatStartPrompt />}
      </div>

      {/* Chat Input */}
      <div className="p-4 mx-4 mb-4">
        <ChatInput onSend={() => console.log('ok')} />
      </div>
    </div>
  );
};
