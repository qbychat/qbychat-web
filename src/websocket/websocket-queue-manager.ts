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

import Queue from 'queue';
import log from 'loglevel';

export class WebsocketQueueManager {
  private packetQueue: Queue;

  constructor() {
    this.packetQueue = new Queue({ results: [] });
  }

  /**
   * Add a task to the queue
   */
  enqueueTask(task: () => Promise<void>): void {
    this.packetQueue.push(task);
  }

  /**
   * Process all queued tasks
   */
  async processQueue(): Promise<void> {
    log.info('🚀 Begin sending queued packets');
    try {
      await this.packetQueue.start();
      log.info('✅ Success send all queued packets');
    } catch (error) {
      log.error('❌ Failed to process queued packets:', error);
      throw error;
    }
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.packetQueue.length === 0;
  }

  /**
   * Get queue length
   */
  getLength(): number {
    return this.packetQueue.length;
  }

  /**
   * Clear queue
   */
  clear(): void {
    // Clear the queue - unfortunately Queue doesn't have a clear method
    // so we need to create a new instance
    this.packetQueue = new Queue({ results: [] });
  }
}

export default WebsocketQueueManager;