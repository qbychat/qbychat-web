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

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_NAME__: JSON.stringify(pkg.name),
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chunk1: [
            'react', 'react-dom', 'react-hook-form', 'zod',
            'i18next-http-backend', 'i18next-browser-languagedetector',
            'dexie-react-hooks', 'react-i18next', 'react-hook-form',
            'react-resizable-panels', 'react-responsive', 'zustand',
          ],
          chunk2: ['tailwindcss', 'tailwind-merge', 'dexie', 'motion'],
          chunk3: ['loglevel', 'uuid', 'queue', 'js-sha256', 'mitt', 'libsodium-wrappers-sumo'],
        },
      },
    },
  },
});
