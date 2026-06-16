#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { readFileSync, accessSync, constants } from 'fs';

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
  wodev              Start production server on port ${process.env.PORT || '6969'}
  wodev --dev        Start development server with hot reload
  wodev --build      Build for production (requires write access)
  wodev --update     Update to latest version from npm
  wodev --version    Show version
  wodev --help       Show this help

Examples:
  ${isWin ? 'set PORT=8080 && wodev' : 'PORT=8080 wodev'}      Custom port
  npx @wayofmono/wo-cto-dashboard           Run without installing

Note:
  After "sudo npm install -g", run "sudo wodev --build" once
  to create the production build. Then "wodev" works as normal user.
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

function canWrite(dir) {
  try {
    accessSync(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function runNext(cmd, extraArgs = []) {
  const port = process.env.PORT || '6969';

  console.log(`🚀 WayOfMono CTO Dashboard - wodev v${getVersion()}`);
  console.log(`🌐 Port: ${port}`);

  const env = {
    ...process.env,
    PORT: port,
    NODE_ENV: cmd === 'dev' ? 'development' : 'production',
  };

  let nextBin;
  try {
    nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
  } catch {
    nextBin = 'next';
  }

  const spawnArgs = [nextBin, cmd, '-p', port, ...extraArgs];
  const child = spawn(process.execPath, spawnArgs, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
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

if (args.includes('--build') || args.includes('-b')) {
  runNext('build');
  process.exit(0);
}

if (args.includes('--dev') || args.includes('-d')) {
  runNext('dev', ['--turbopack']);
  process.exit(0);
}

// Default: production mode (next start - read-only, no .next writes)
const nextDir = path.join(projectRoot, '.next');
try {
  accessSync(nextDir, constants.R_OK);
} catch {
  console.log('');
  console.log('⚠️  No production build found. Run "wodev --build" first.');
  console.log('   Or use "wodev --dev" for development mode with hot reload.');
  console.log('');
  console.log('   After sudo install: sudo wodev --build  (one-time)');
  console.log('   Then:               wodev               (as normal user)');
  console.log('');
  process.exit(1);
}

runNext('start');
