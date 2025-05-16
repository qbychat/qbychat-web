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

import {
  RegisterClientRequest,
  RegisterClientResponse,
  ResumeClientRequest,
  ResumeClientResponse,
} from '@/proto/qbychat/websocket/session/v1/service';
import { RequestMethod } from '@/proto/qbychat/websocket/protocol/v1/common';
import { Platform } from '@/proto/qbychat/common/v1/platform';
import { UAParser } from 'ua-parser-js';
import log from 'loglevel';
import { PacketServiceInterface } from './types';
import WebsocketEventEmitter from './WebsocketEventEmitter';

export class WebsocketAuthService {
  private eventEmitter: WebsocketEventEmitter;
  private packetService: PacketServiceInterface;
  private authToken: string | null;

  constructor(
    eventEmitter: WebsocketEventEmitter,
    packetService: PacketServiceInterface,
    authToken: string | null
  ) {
    this.eventEmitter = eventEmitter;
    this.packetService = packetService;
    this.authToken = authToken;
  }

  /**
   * Perform authentication
   */
  async authenticate(): Promise<void> {
    if (this.authToken) {
      await this.resumeSession();
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
    const request: ResumeClientRequest = {
      token: this.authToken,
    };

    log.debug('📦 ResumeClientRequest:', request);
    const response = await this.packetService.request<ResumeClientResponse>(
      ResumeClientResponse,
      null,
      RequestMethod.RESUME_CLIENT_V1,
      ResumeClientRequest.toBinary(request)
    );

    if (response.accountIds.length === 0) {
      log.info('💡 No account available, login requires.');
      this.eventEmitter.sendEvent('requireLogin', null);
    } else {
      log.info(`✅ Account ${response.currentAccountId} is available (${response.accountIds.length} account(s) available)`);
      this.eventEmitter.sendEvent('loginSuccess', {
        mainAccountId: response.currentAccountId,
        LoggedInAccountIds: response.accountIds,
      });
    }
  }

  /**
   * Register a new client
   */
  private async registerClient(): Promise<void> {
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

    if (!isBrowser) {
      throw new Error('Nodejs is currently unsupported');
    }

    // parse User-Agent
    const ua = UAParser(navigator.userAgent);

    const request: RegisterClientRequest = {
      clientMetadata: {
        clientName: __APP_NAME__,
        clientVersion: __APP_VERSION__,
        platform: Platform.BROWSER,
        platformDetails: `${ua.browser.name} v${ua.browser.version} on ${ua.os.name}`,
      },
    };

    // send request
    log.info('🚀 Begin Registering client', request);
    const response = await this.packetService.request<RegisterClientResponse>(
      RegisterClientResponse,
      null,
      RequestMethod.REGISTER_CLIENT_V1,
      RegisterClientRequest.toBinary(request)
    );

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

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }
}

export default WebsocketAuthService;