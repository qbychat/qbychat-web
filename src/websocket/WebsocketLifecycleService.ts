/*
 * Copyright (c) 2025. All rights reserved.
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
import { ConnectionConfig, IPacketService, WebsocketEvents } from './types';
import WebsocketConnectionManager from './WebsocketConnectionManager.ts';
import WebsocketEncryptionService from './WebsocketEncryptionService.ts';
import WebsocketEventEmitter from './WebsocketEventEmitter.ts';
import WebsocketMessageHandler from './WebsocketMessageHandler.ts';
import WebsocketQueueManager from './WebsocketQueueManager.ts';
import WebsocketAuthService from './WebsocketAuthService.ts';
import { KeyPair } from '@/utils/cipherUtils.ts';
import IWebsocketService from '@/websocket/IWebsocketService.ts';
import ClientService from '@/websocket/services/ClientService.ts';
import UserService from '@/websocket/services/UserService.ts';
import { fromBinary, Message } from '@bufbuild/protobuf';
import { ClientboundMessageSchema, RPCRequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common_pb';
import type { GenMessage } from '@bufbuild/protobuf/codegenv1';
import AuthService from '@/websocket/services/AuthService.ts';

class WebsocketLifecycleService implements IPacketService {
  // Configuration
  private readonly config: ConnectionConfig;

  // Service components
  private connectionManager: WebsocketConnectionManager;
  private encryptionService: WebsocketEncryptionService;
  private readonly eventEmitter: WebsocketEventEmitter;
  private messageHandler: WebsocketMessageHandler;
  private queueManager: WebsocketQueueManager;
  private authService: WebsocketAuthService;

  private serviceMap = new Map<string, IWebsocketService>();

  private keyPair: KeyPair | undefined;

  constructor(url: string, authToken: string | null, baseReconnectInterval: number = 5000) {
    // Create configuration
    this.config = {
      url,
      authToken,
      baseReconnectInterval,
      maxReconnectInterval: 30000,
    };

    // Initialize components
    this.eventEmitter = new WebsocketEventEmitter();
    this.encryptionService = new WebsocketEncryptionService();
    this.connectionManager = new WebsocketConnectionManager(this.config, this.eventEmitter);
    this.queueManager = new WebsocketQueueManager();
    this.messageHandler = new WebsocketMessageHandler(
      this.eventEmitter,
      this.sendPacket.bind(this),
    );

    // Initialize services
    this.registerService(new UserService(this, this.eventEmitter));
    this.registerService(new AuthService(this, this.eventEmitter));
    const clientService = this.registerService(new ClientService(this));

    this.authService = new WebsocketAuthService(
      this.eventEmitter,
      clientService,
      authToken,
    );

    // Set up connection callbacks
    this.connectionManager.setOnOpenCallback(this.handleConnectionOpen.bind(this));
    this.connectionManager.setOnMessageCallback(this.handleMessage.bind(this));

    // Register internal events
    this.eventEmitter.registerEvent('triggerSync', (data) => this.sync(data.accountId));
  }

  /**
   * Test the WebSocket connection
   */
  testConnection(): Promise<boolean> {
    return this.connectionManager.testConnection();
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    await this.connectionManager.connect();
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    this.connectionManager.close();
    this.eventEmitter.clearAllEvents();
  }

  /**
   * Handle WebSocket connection open event
   */
  private async handleConnectionOpen(): Promise<void> {
    // Generate keypair for handshake
    this.keyPair = this.encryptionService.generateKeyPair();
    log.debug('✅ Created X25519 keypair');

    // Create and send handshake message
    const handshakeMessage = this.encryptionService.createHandshakeMessage(this.keyPair);
    this.connectionManager.sendData(handshakeMessage);
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(data: Uint8Array): Promise<void> {
    // Check if handshake is completed
    if (!this.encryptionService.isHandshakeCompleted()) {
      // Process handshake
      await this.encryptionService.handleHandshakeResponse(data, this.keyPair!);

      // After handshake, proceed with authentication
      if (this.encryptionService.isHandshakeCompleted()) {
        this.eventEmitter.updateStatus('authenticating');
        await this.authService.authenticate();

        // Process queued packets
        log.info('🚀 Begin updating data');
        this.eventEmitter.updateStatus('updating');
        await this.queueManager.processQueue();

        // Now ready
        log.info('✅ Websocket is ready');
        this.eventEmitter.updateStatus('open');
      }
      return;
    }

    // Process regular message
    let decryptedData: Uint8Array;
    const isEncrypted = !!this.encryptionService.getState().chacha20Key;

    if (isEncrypted) {
      const result = this.encryptionService.decryptIncomingMessage(data);
      if (!result.success || !result.data) {
        log.error('❌ Failed to decrypt message');
        return;
      }
      decryptedData = result.data;
    } else {
      decryptedData = data;
    }

    // Parse clientbound message
    const clientboundMessage = fromBinary(ClientboundMessageSchema, decryptedData);
    this.messageHandler.handlePacket(clientboundMessage);
  }

  /**
   * Sync data from the remote
   * */
  private async sync(accountId: string): Promise<void> {
    log.info(`🚀 Start sync data for account ${accountId}`);
    for (const service of this.serviceMap.values()) {
      await service.sync(accountId);
    }
    log.info(`✅ Sync completed (account: ${accountId})`);
    this.eventEmitter.sendEvent('syncCompleted', { accountId });
  }

  /**
   * Send a packet
   */
  sendPacket(data: Uint8Array): void {
    // Check if connected
    if (this.connectionManager.isConnected()) {
      let payload: Uint8Array;

      if (this.encryptionService.isHandshakeCompleted()) {
        // Encrypt payload
        payload = this.encryptionService.encryptOutgoingMessage(data);
      } else {
        // Not encrypted
        payload = data;
      }

      // Send payload
      this.connectionManager.sendData(payload);
    } else {
      // Add task to queue
      log.debug('WebSocket not connected, adding packet to queue');
      this.queueManager.enqueueTask(() => {
        return new Promise<void>((resolve, reject) => {
          try {
            this.sendPacket(data);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  /**
   * Send a request and wait for response
   */
  async request<T extends Message>(
    type: GenMessage<T>,
    userId: string | null,
    method: RPCRequestMethod,
    payload: Uint8Array | null,
    timeout: number = 15000,
  ): Promise<T> {
    return this.messageHandler.request(type, userId, method, payload, timeout);
  }

  /**
   * Register an event handler
   */
  registerEvent<T extends keyof WebsocketEvents>(
    eventName: T,
    handler: (data: WebsocketEvents[T]) => void | Promise<void>,
  ): void {
    this.eventEmitter.registerEvent(eventName, handler);
  }

  /**
   * Unregister an event handler
   */
  unregisterEvent<T extends keyof WebsocketEvents>(
    eventName: T,
    handler: (data: WebsocketEvents[T]) => void | Promise<void>,
  ): void {
    this.eventEmitter.unregisterEvent(eventName, handler);
  }

  /**
   * Register a rpc service
   * */
  registerService<T extends IWebsocketService>(instance: T): T {
    const key = instance.constructor.name;
    this.serviceMap.set(key, instance);
    return instance;
  }

  /**
   * Get a rpc service
   * */
  getService<T extends IWebsocketService>(ctor: { new(...args: never[]): T }): T {
    const key = typeof ctor === 'function' ? ctor.name : '';
    const instance = this.serviceMap.get(key);
    if (!instance) {
      throw new Error(`Service not registered: ${key}`);
    }
    return instance as T;
  }
}

export default WebsocketLifecycleService;
