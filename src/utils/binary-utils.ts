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

class BinaryUtils {
  async blobToByteArray(blob: Blob) {
    const buffer = await new Response(blob).arrayBuffer();
    return new Uint8Array(buffer);
  }

  numberToUint8(num: number): Uint8Array {
    const arr = new Uint8Array(1);
    arr[0] = num & 0xFF;
    return arr;
  }
}

const instance = new BinaryUtils();

export default instance;