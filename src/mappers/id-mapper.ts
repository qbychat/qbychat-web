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

import { FederationId, FederationIdSchema } from '@/proto/qbychat/rpc/federation/v1/federation_model_pb';
import { FederationIdModel, IdType } from '@/types/id-types.ts';
import { parseProtobufLocalId, protobufLocalIdOf } from '@/utils/proto-utils.ts';
import { create } from '@bufbuild/protobuf';

export const convertFederationIdV1 = (federationId: FederationId): FederationIdModel => {
  return {
    domain: federationId.domain,
    localId: parseProtobufLocalId(federationId.localId!),
  };
};

export function federationIdOf(model: FederationIdModel): FederationId;
export function federationIdOf(localId: IdType, domain?: string): FederationId;

export function federationIdOf(
  arg1: IdType | FederationIdModel,
  domain?: string
): FederationId {
  if (typeof arg1 === 'object' && arg1 !== null && 'localId' in arg1) {
    // 传入的是 FederationIdModel
    return create(FederationIdSchema, {
      localId: protobufLocalIdOf(arg1.localId),
      domain: arg1.domain,
    });
  }

  // 传入的是 localId + domain
  return create(FederationIdSchema, {
    localId: protobufLocalIdOf(arg1 as IdType),
    domain: domain,
  });
}