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

import log from 'loglevel';
import WebsocketEventEmitter from './WebsocketEventEmitter';
import { ConnectionConfig } from './types';
import { blobToByteArray } from '@/utils/binaryUtils';
import { ClientDiscoveryConfig, fetchClientDiscovery } from '@/well-known/discovery.ts';
import axios from 'axios';

export class WebsocketConnectionManager {
  private socket: WebSocket | null = null;
  private config: ConnectionConfig;
  private eventEmitter: WebsocketEventEmitter;
  private reconnectAttempts: number = 0;
  private reconnectInterval: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;
  private discoveryConfig: ClientDiscoveryConfig | null = null;

  // Callbacks that will be injected from the main service
  private onOpenCallback: (() => void) | null = null;
  private onMessageCallback: ((data: Uint8Array) => void) | null = null;

  constructor(config: ConnectionConfig, eventEmitter: WebsocketEventEmitter) {
    this.config = config;
    this.eventEmitter = eventEmitter;
    this.reconnectInterval = config.baseReconnectInterval;
  }

  /**
   * Set the callback for websocket open event
   */
  setOnOpenCallback(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  /**
   * Set the callback for websocket message event
   */
  setOnMessageCallback(callback: (data: Uint8Array) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Test connection to the WebSocket server
   */
  async testConnection(): Promise<boolean> {
    // receive config
    const discoveryConfig = await this.receiveConfig();
    return await new Promise<boolean>((resolve) => {
      if (this.socket !== null && this.socket.readyState === WebSocket.OPEN) {
        resolve(true); // already connected
        return;
      }

      const socket = new WebSocket(discoveryConfig.websocketAddress);

      const timeoutId = setTimeout(() => {
        socket.close();
        resolve(false);
      }, 5000);

      socket.onopen = () => {
        clearTimeout(timeoutId);
        socket.close();
        resolve(true); // connection successful
      };

      socket.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };

      socket.onclose = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
    });
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket !== null) {
      return; // already connected
    }
    const discoveryConfig = await this.receiveConfig();

    // create socket
    this.socket = new WebSocket(discoveryConfig.websocketAddress);
    this.eventEmitter.updateStatus('connecting');

    log.info(`🚀 Start connecting to websocket ${this.config.url}`);

    this.socket.onopen = () => {
      // socket opened
      // reset state
      this.reconnectAttempts = 0;
      this.reconnectInterval = this.config.baseReconnectInterval;
      this.shouldReconnect = true;

      log.info(`✅ Success connect to websocket ${discoveryConfig.websocketAddress}, start handshake`);

      // Call the onOpen callback if it's set
      if (this.onOpenCallback) {
        this.onOpenCallback();
      }
    };

    this.socket.onmessage = async (e: MessageEvent) => {
      // read buffer
      const bytes = await blobToByteArray(e.data);

      // Call the onMessage callback if it's set
      if (this.onMessageCallback) {
        this.onMessageCallback(bytes);
      }
    };

    this.socket.onclose = () => {
      // do reconnect
      this.eventEmitter.updateStatus('closed');
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      log.error('WebSocket error:', error);
    };
  }

  /**
   * Send data through the WebSocket
   */
  sendData(data: Uint8Array): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      log.error('❌ Tried to send data but WebSocket is not open');
      throw new Error('WebSocket is not open');
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.socket === null || !this.shouldReconnect) {
      // manually closed socket, skip reconnect
      return;
    }

    this.socket = null;
    this.reconnectAttempts++;

    // calculate new reconnect interval
    this.reconnectInterval = Math.min(
      this.config.baseReconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.config.maxReconnectInterval,
    );

    // update status
    this.eventEmitter.updateStatus('waiting');
    this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
  }

  private async receiveConfig() {
    if (this.discoveryConfig === null) {
      const axiosInstance = axios.create({
        baseURL: this.config.url,
      });
      this.discoveryConfig = await fetchClientDiscovery(axiosInstance);
    }
    return this.discoveryConfig;
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export default WebsocketConnectionManager;
