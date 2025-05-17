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

import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  let preload: string;
  if (!app.isPackaged) {
    preload = path.resolve(app.getAppPath(), '.tmp/dist-electron/preload.js');
  } else {
    preload = path.resolve(app.getAppPath(), 'preload.js');
  }

  const win = new BrowserWindow({
    webPreferences: {
      preload: preload,
      devTools: true,
      sandbox: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    width: 1200,
    height: 650,
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile('dist/index.html');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});