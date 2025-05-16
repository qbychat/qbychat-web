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
  ClientboundMessage,
  RequestMethod,
  RPCResponse,
  RPCResponse_Status,
  ServerboundMessage,
} from '@/proto/qbychat/websocket/protocol/v1/common';
import { RPCResponsePromiseHandlers } from './types';
import { RPCError } from '@/websocket/errors/RPCError';
import { MessageType } from '@protobuf-ts/runtime';
import { sha256 } from 'js-sha256';
import { numToUint8Array } from '@/utils/binaryUtils';
import log from 'loglevel';
import WebsocketEventEmitter from './WebsocketEventEmitter';

export class WebsocketMessageHandler {
  private responseHandlers: Map<string, RPCResponsePromiseHandlers> = new Map();
  private ticketCounter: number = 0;
  private eventEmitter: WebsocketEventEmitter;
  private sendPacketFn: (data: Uint8Array) => void;

  constructor(eventEmitter: WebsocketEventEmitter, sendPacketFn: (data: Uint8Array) => void) {
    this.eventEmitter = eventEmitter;
    this.sendPacketFn = sendPacketFn;
  }

  /**
   * Handle incoming packet
   */
  handlePacket(packet: ClientboundMessage): void {
    const userId = packet.userId;

    if (packet.content.oneofKind === 'response') {
      this.handleResponse(packet.content.response);
    } else if (packet.content.oneofKind === 'event') {
      this.handleEvent(userId, packet.content.event);
    }
  }

  /**
   * Handle response packet
   */
  private handleResponse(response: RPCResponse): void {
    const ticketHash = sha256(response.ticket!);
    log.info(`📥 Received response with ticket ${ticketHash}`);
    log.debug('📥 Received response', response);

    const responseHandler = this.responseHandlers.get(ticketHash);
    if (responseHandler) {
      // invoke handler
      if (response.status === RPCResponse_Status.SUCCESS) {
        // success
        responseHandler.resolve(response);
      } else {
        // error
        responseHandler.reject(new RPCError(response.status, response.message));
      }
      // cleanup handler
      this.responseHandlers.delete(ticketHash);
    }
  }

  /**
   * Handle event packet
   */
  private handleEvent(userId: string | undefined, event: { typeUrl: string; value: Uint8Array }): void {
    log.info(`Received event ${event.typeUrl}`);
    // emit event
    this.eventEmitter.sendSseEvent(userId, event.typeUrl, event.value);
  }

  /**
   * Send a request and wait for response
   */
  async request<T extends object>(
    type: MessageType<T>,
    userId: string | null,
    method: RequestMethod,
    payload: Uint8Array | null,
    timeout: number = 15000,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // create ticket
      const ticket = numToUint8Array(++this.ticketCounter);
      const ticketHash = sha256(ticket);

      // build request
      const message: ServerboundMessage = {
        userId: userId === null ? undefined : userId,
        request: {
          ticket: ticket,
          method: method,
          payload: payload === null ? undefined : payload,
        },
      };

      // Set a timeout to reject the promise after the specified time
      const timeoutId = setTimeout(() => {
        // If the timeout occurs, reject the promise
        log.error(`❌ Request with ticket ${ticketHash} timed out after ${timeout}ms`);
        this.responseHandlers.delete(ticketHash); // Clean up the ticket from the map
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      const callback = (response: RPCResponse) => {
        // clean timeout
        clearTimeout(timeoutId);
        // parse payload
        resolve(type.fromBinary(response.payload!));
      };

      this.responseHandlers.set(ticketHash, {
        resolve: callback,
        reject: reject,
      });

      // send request
      log.info(`📦 Request: method ${method}`, { ticketHash });
      log.debug(`📦 Payload for method ${method}`, { ticketHash, payload });

      this.sendPacketFn(ServerboundMessage.toBinary(message));
    });
  }

  /**
   * Clear all response handlers
   */
  clearHandlers(): void {
    this.responseHandlers.clear();
  }
}

export default WebsocketMessageHandler;
