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

// ---------------------------------------------------------------------------
// ANSI colors — orange theme
// ---------------------------------------------------------------------------

const C = {
  orange: '\x1b[38;5;208m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  green: '\x1b[38;5;82m',
  red: '\x1b[38;5;196m',
  yellow: '\x1b[38;5;226m',
  cyan: '\x1b[38;5;51m',
};

function o(s) { return `${C.orange}${s}${C.reset}`; }
function ob(s) { return `${C.bold}${C.orange}${s}${C.reset}`; }
function od(s) { return `${C.dim}${C.orange}${s}${C.reset}`; }
function green(s) { return `${C.green}${s}${C.reset}`; }
function red(s) { return `${C.red}${s}${C.reset}`; }
function yellow(s) { return `${C.yellow}${s}${C.reset}`; }
function cyan(s) { return `${C.cyan}${s}${C.reset}`; }

// ---------------------------------------------------------------------------
// WODEV ASCII logo
// ---------------------------------------------------------------------------

const WODEV_LOGO = [
  '██╗    ██╗ ██████╗ ██████╗ ███████╗██╗   ██╗',
  '██║    ██║██╔═══██╗██╔══██╗██╔════╝██║   ██║',
  '██║ █╗ ██║██║   ██║██║  ██║█████╗  ██║   ██║',
  '██║███╗██║██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝',
  '╚███╔███╔╝╚██████╔╝██████╔╝███████╗ ╚████╔╝ ',
  ' ╚══╝╚══╝  ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  ',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVersion() {
  try {
    const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

function printLogo() {
  for (const line of WODEV_LOGO) console.log(o(`  ${line}`));
  console.log();
  console.log(`  ${ob('⟡ CTO DASHBOARD')}  ${od('wodev — release & deploy')}  ${od('─'.repeat(20))}`);
  console.log();
}

function showHelp() {
  printLogo();

  console.log(`  ${o('┌')}${od('─'.repeat(48))}${o('┐')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev${C.reset}              Start production server            ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --dev${C.reset}         Development server (hot reload)    ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --build${C.reset}       Build for production               ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --update${C.reset}      Update to latest npm version       ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --version${C.reset}     Show version                       ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --help${C.reset}        Show this help                     ${o('│')}`);
  console.log(`  ${o('└')}${od('─'.repeat(48))}${o('┘')}`);

  console.log();
  console.log(`  ${ob('⟡ EXAMPLES')}`);
  console.log(`  ${od('─'.repeat(40))}`);
  console.log(`  ${isWin ? 'set PORT=8080 && wodev' : 'PORT=8080 wodev'}`);
  console.log(`  npx @wayofmono/wo-cto-dashboard`);
  console.log();
  console.log(`  ${od('Port')} ${od('→')} ${cyan('6969')} ${od('(default, override with PORT=)')}`);
  console.log();
}

function updateDashboard() {
  printLogo();
  console.log(`  ${ob('⟡ UPDATE')}  ${od('checking npm registry')}  ${od('─'.repeat(15))}`);
  console.log();
  try {
    execSync('npm update -g @wayofmono/wo-cto-dashboard', { stdio: 'inherit' });
    console.log(`  ${green('✓')} ${C.bold}Dashboard updated${C.reset} to latest version`);
  } catch {
    console.log();
    console.log(`  ${yellow('⚠')}  Could not update automatically.`);
    if (isWin) {
      console.log(`     ${od('Try running as Administrator.')}`);
    } else {
      console.log(`     ${od('Try:')} ${C.bold}sudo npm update -g @wayofmono/wo-cto-dashboard${C.reset}`);
    }
  }
  console.log();
}

function runNext(cmd, extraArgs = []) {
  const port = process.env.PORT || '6969';

  printLogo();
  console.log(`  ${ob('⟡ ' + (cmd === 'dev' ? 'DEV SERVER' : cmd === 'build' ? 'BUILD' : 'PRODUCTION'))}  ${od('port ' + port)}  ${od('─'.repeat(20))}`);
  console.log();

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

  const portArgs = cmd !== 'build' ? ['-p', port] : [];
  const spawnArgs = [nextBin, cmd, ...portArgs, ...extraArgs];
  const child = spawn(process.execPath, spawnArgs, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`  ${red('✗')} Failed to start: ${err.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`  ${red('✗')} Process exited with code ${code}`);
    }
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log(`\n  ${od('🛑 Shutting down...')}`);
    child.kill('SIGINT');
  });

  if (!isWin) {
    process.on('SIGTERM', () => {
      console.log(`\n  ${od('🛑 Shutting down...')}`);
      child.kill('SIGTERM');
    });
  }
}

// ---------------------------------------------------------------------------
// CLI dispatch
// ---------------------------------------------------------------------------

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

// Default: production mode (next start — read-only, no .next writes)
const nextDir = path.join(projectRoot, '.next');
try {
  accessSync(nextDir, constants.R_OK);
} catch {
  printLogo();
  console.log(`  ${yellow('⚠')}  ${C.bold}No production build found.${C.reset}`);
  console.log(`     ${od('Run')} ${C.bold}wodev --build${C.reset} ${od('first, or use')} ${C.bold}wodev --dev${C.reset} ${od('for development.')}`);
  console.log();
  console.log(`  ${o('┌')}${od('─'.repeat(48))}${o('┐')}`);
  console.log(`  ${o('│')}  ${od('After sudo install:')}                         ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}  sudo wodev --build${C.reset}  ${od('(one-time)')}           ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}  wodev${C.reset}              ${od('(as normal user)')}      ${o('│')}`);
  console.log(`  ${o('│')}                                         ${o('│')}`);
  console.log(`  ${o('│')}  ${od('Better: install without sudo:')}               ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}  npm config set prefix ~/.npm-global${C.reset}       ${o('│')}`);
  console.log(`  ${o('└')}${od('─'.repeat(48))}${o('┘')}`);
  console.log();
  process.exit(1);
}

runNext('start');
