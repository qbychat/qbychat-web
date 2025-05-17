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

const { execSync } = require('child_process');
const path = require('path');

function runScript(relativePath) {
  const fullPath = path.resolve(__dirname, relativePath);
  console.log(`[postinstall] Running ${relativePath}`);
  execSync(`node ${fullPath}`, { stdio: 'inherit' });
}


try {
  runScript('gen-proto.cjs');
  runScript('../node_modules/electron/install.js');
  console.log('[postinstall] Done.');
} catch (err) {
  console.error('[postinstall] Failed:', err);
  process.exit(1);
}


