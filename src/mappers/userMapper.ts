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


import { convertFederationIdV1 } from '@/mappers/idMapper.ts';
import { PublicUserInfo } from '@/proto/qbychat/rpc/user/v1/user_model_pb';
import { PublicUserInfoModel } from '@/types/userTypes.ts';

export function convertPublicUserInfoV1(proto: PublicUserInfo): PublicUserInfoModel {
  return {
    userId: convertFederationIdV1(proto.userId!),
    username: proto.username,
    nickname: proto.nickname,
    bio: proto.bio,
  };
}