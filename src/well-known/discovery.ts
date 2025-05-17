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

import { AxiosInstance } from 'axios';
import camelcaseKeys from 'camelcase-keys';

export interface ClientDiscoveryConfig {
  websocketAddress: string;
  requireEncryption: boolean;
}

export async function fetchClientDiscovery(axiosInstance: AxiosInstance): Promise<ClientDiscoveryConfig> {
  const response = await axiosInstance.get('/.well-known/qbychat/client.json');
  const data = camelcaseKeys(response.data, { deep: true });

  return {
    websocketAddress: data.homeserver.websocketAddress,
    requireEncryption: data.homeserver.requireEncryption,
  };
}
