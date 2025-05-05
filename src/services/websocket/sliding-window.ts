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

class SlidingWindow {
  private baseSeq: bigint = BigInt(0);
  private receivedSeqs: Set<bigint> = new Set();
  private readonly windowSize: bigint;

  constructor(windowSize: bigint = BigInt(64)) {
    this.windowSize = windowSize;
  }

  accept(sequence: bigint): boolean {
    // Ensure sequence is within the window size range
    if (sequence < this.baseSeq) {
      return false;
    }

    if (sequence >= this.baseSeq + this.windowSize) {
      return false;
    }

    if (this.receivedSeqs.has(sequence)) {
      return false;
    }

    // Add sequence to the set
    this.receivedSeqs.add(sequence);
    this.slideWindow();

    return true;
  }

  private slideWindow(): void {
    // Slide the window to remove any sequence numbers up to baseSeq
    while (this.receivedSeqs.has(this.baseSeq)) {
      this.receivedSeqs.delete(this.baseSeq);
      this.baseSeq++;
    }
  }
}

export default SlidingWindow;