/*
 * Copyright (c) 2025. All rights reserved.
 *
 * This file is a part of the QbyChat project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import mitt from 'mitt';
import { WebsocketEvents, SSEPayload, WebSocketStatus } from './types';

export class WebsocketEventEmitter {
  private emitter = mitt<WebsocketEvents>();

  /**
   * Register an event handler
   */
  registerEvent<T extends keyof WebsocketEvents>(
    eventName: T,
    handler: (data: WebsocketEvents[T]) => void | Promise<void>
  ): void {
    this.emitter.on(eventName, handler);
  }

  /**
   * Unregister an event handler
   */
  unregisterEvent<T extends keyof WebsocketEvents>(
    eventName: T,
    handler: (data: WebsocketEvents[T]) => void | Promise<void>
  ): void {
    this.emitter.off(eventName, handler);
  }

  /**
   * Send an event
   */
  sendEvent<T extends keyof WebsocketEvents>(eventName: T, data: WebsocketEvents[T]): void {
    this.emitter.emit(eventName, data);
  }

  /**
   * Send an SSE event
   */
  sendSseEvent<T>(userId: string | null | undefined, eventType: string, payload: T): void {
    const ssePayload: SSEPayload<T> = {
      userId,
      eventType,
      payload,
    };
    this.sendEvent('sse', ssePayload);
  }

  /**
   * Update WebSocket status
   */
  updateStatus(status: WebSocketStatus): void {
    this.sendEvent('updateStatus', status);
  }

  /**
   * Clear all events
   */
  clearAllEvents(): void {
    this.emitter.all.clear();
  }
}

export default WebsocketEventEmitter;