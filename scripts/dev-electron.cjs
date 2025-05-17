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

const { spawn, execSync } = require('child_process');
const { createServer } = require('vite');
const path = require('path');

(async () => {
  // Start Vite server
  console.log("Starting vite...");
  const viteServer = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
  });
  await viteServer.listen();

  // Build typescript
  console.log('Building typescript for electron');
  execSync('pnpm run transpile:electron')
  console.log('Build finished');

  // Launch Electron
  console.log('Starting Electron...');
  const electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    env: process.env,
  });

  electronProcess.on('close', () => {
    viteServer.close();
    process.exit();
  });
})();