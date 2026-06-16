#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const isWin = process.platform === 'win32';
const args = process.argv.slice(2);

function getVersion() {
  try {
    const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

function showHelp() {
  console.log(`
🚀 WayOfMono CTO Dashboard - wodev v${getVersion()}

Usage:
  wodev              Start dev server on port ${process.env.PORT || '6969'}
  wodev --update     Update to latest version from npm
  wodev --version    Show version
  wodev --help       Show this help

Examples:
  ${isWin ? 'set PORT=8080 && wodev' : 'PORT=8080 wodev'}    Start on custom port
  npx @wayofmono/wo-cto-dashboard                            Run without installing
`);
}

function updateDashboard() {
  console.log('🔄 Checking for updates...');
  try {
    execSync('npm update -g @wayofmono/wo-cto-dashboard', { stdio: 'inherit' });
    console.log('✅ Dashboard updated to latest version');
  } catch {
    console.log('');
    console.log('⚠️  Could not update automatically.');
    if (isWin) {
      console.log('   Try running as Administrator.');
    } else {
      console.log('   Try: sudo npm update -g @wayofmono/wo-cto-dashboard');
    }
  }
}

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(getVersion());
  process.exit(0);
}

if (args.includes('--update') || args.includes('-u')) {
  updateDashboard();
  process.exit(0);
}

const port = process.env.PORT || '6969';

console.log('🚀 Starting WayOfMono CTO Dashboard...');
console.log(`🌐 Port: ${port}`);

const env = {
  ...process.env,
  PORT: port,
  NODE_ENV: 'development',
};

let nextBin;
try {
  nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
} catch {
  nextBin = 'next';
}

const child = spawn(process.execPath, [nextBin, 'dev', '-p', port], {
  cwd: projectRoot,
  env,
  stdio: 'inherit',
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

if (!isWin) {
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down...');
    child.kill('SIGTERM');
  });
}
