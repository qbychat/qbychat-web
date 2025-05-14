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
const crypto = require('crypto');

const protoDir = 'proto';
const outDir = 'src/proto';
const pluginPath = './node_modules/.bin/protoc-gen-ts';
const hashCachePath = './node_modules/.protohashes.json';

const files = glob.sync(`${protoDir}/**/*.proto`);

let lastHashes = {};
if (fs.existsSync(hashCachePath)) {
  try {
    lastHashes = JSON.parse(fs.readFileSync(hashCachePath, 'utf8'));
  } catch {
    console.warn('Warning: failed to parse existing proto hash cache.');
  }
}

const hashFile = filePath => {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(content).digest('hex');
};

const changedFiles = files.filter(file => {
  const hash = hashFile(file);
  return lastHashes[file] !== hash;
});

if (changedFiles.length === 0) {
  console.log('No .proto file changes detected. Skipping generation.');
  process.exit(0);
}

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

const cmd = [
  'pnpm exec protoc',
  `--plugin=protoc-gen-ts=${pluginPath}`,
  '--ts_opt ts_nocheck',
  '--ts_opt eslint_disable',
  `--ts_out=${outDir}`,
  `--proto_path=${protoDir}`,
  ...files,
].join(' ');

console.log('Changes detected in:', changedFiles.join(', '));
console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });

const newHashes = {};
for (const file of files) {
  newHashes[file] = hashFile(file);
}
fs.writeFileSync(hashCachePath, JSON.stringify(newHashes, null, 2));
