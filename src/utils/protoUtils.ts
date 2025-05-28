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

import { Id, IdSchema } from '@/proto/qbychat/common/v1/id_pb';
import { create } from '@bufbuild/protobuf';

export type IdType = string | bigint;

export const parseProtobufLocalId = (id: Id | null | undefined): IdType | undefined => {
  if (!id) return undefined;
  if (!id.content.value) throw new Error('Id.content was undefined');
  return id.content.value;
};

export const protobufLocalIdOf = (id: IdType | null | undefined): Id | undefined => {
  if (!id) return undefined;
  if (typeof id === 'string') {
    return create(IdSchema, {
      content: {
        case: 'stringId',
        value: id,
      },
    });
  } else {
    return create(IdSchema, {
      content: {
        case: 'longId',
        value: id,
      },
    });
  }
};
