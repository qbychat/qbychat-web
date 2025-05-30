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
import ClientService from '@/websocket/services/ClientService.ts';
import { RpcError } from '@/websocket/errors/RpcError.ts';
import { RpcResponse_Status } from '@/proto/qbychat/rpc/protocol/v1/rpc_messages_pb';

export class WebsocketAuthService {
  private eventEmitter: WebsocketEventEmitter;
  private clientService: ClientService;
  private authToken: string | null;

  constructor(
    eventEmitter: WebsocketEventEmitter,
    clientService: ClientService,
    authToken: string | null,
  ) {
    this.eventEmitter = eventEmitter;
    this.clientService = clientService;
    this.authToken = authToken;
  }

  /**
   * Perform authentication
   */
  async authenticate(): Promise<void> {
    if (this.authToken) {
      try {
        await this.resumeSession();
      } catch (e) {
        if (e instanceof RpcError) {
          if (e.status === RpcResponse_Status.UNAUTHORIZED) {
            // the client was revoked at the serverside
            // try to register a new one
            await this.registerClient();
          }
        }
      }
    } else {
      await this.registerClient();
    }
  }

  /**
   * Resume existing session
   */
  private async resumeSession(): Promise<void> {
    if (!this.authToken) throw new Error('Auth token is missing');

    log.info('🚀 Start to resume session');
    const response = await this.clientService.resumeClient(this.authToken);

    if (response.accountIds.length === 0) {
      log.info('💡 No account available, login requires.');
      this.eventEmitter.sendEvent('requireLogin', null);
    } else {
      log.info(`✅ Account ${response.currentAccountId} is available (${response.accountIds.length} account(s) available)`);
      this.eventEmitter.sendEvent('loginStateSynced', {
        mainAccountId: response.currentAccountId,
        loggedInAccountIds: response.accountIds,
      });
      this.eventEmitter.sendEvent('switchMainAccount', {
        mainAccountId: response.currentAccountId,
      });
      this.eventEmitter.sendEvent('triggerSync', {
        accountId: response.currentAccountId,
      });
    }
  }

  /**
   * Register a new client
   */
  private async registerClient(): Promise<void> {
    const response = await this.clientService.registerClient();

    log.info('📥 Successfully registered client');
    log.debug(`📥 Client authToken: ${response.token}`);

    // send event
    this.eventEmitter.sendEvent('updateToken', {
      token: response.token,
    });
    this.eventEmitter.sendEvent('requireLogin', null);

    // Update the auth token for future use
    this.authToken = response.token;
  }
}

export default WebsocketAuthService;