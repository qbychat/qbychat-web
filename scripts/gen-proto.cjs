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
const glob = require('glob');
const fs = require('fs');

const files = glob.sync('proto/**/*.proto');
const pluginPath = './node_modules/.bin/protoc-gen-ts';
const outDir = 'src/proto';

const cmd = [
  'npx protoc',
  `--plugin=protoc-gen-ts=${pluginPath}`,
  `--ts_out=${outDir}`,
  '--proto_path=proto',
  ...files,
].join(' ');

console.log('Running:', cmd);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}
execSync(cmd, { stdio: 'inherit' });