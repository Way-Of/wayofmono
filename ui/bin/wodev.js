#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const port = process.env.PORT || '3000';

console.log('🚀 Starting WayOfMono CTO Dashboard...');
console.log(`📍 Project root: ${projectRoot}`);
console.log(`🌐 Port: ${port}`);

const env = {
  ...process.env,
  PORT: port,
  NODE_ENV: 'development',
};

const child = spawn('bun', ['run', 'dev'], {
  cwd: projectRoot,
  env,
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('❌ Failed to start:', err.message);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Process exited with code ${code}`);
  }
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM = () => {
  console.log('\n🛑 Shutting down...');
  child.kill('SIGTERM');
};