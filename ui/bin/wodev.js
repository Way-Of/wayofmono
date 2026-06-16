#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { readFileSync, accessSync, constants, existsSync, appendFileSync, mkdirSync } from 'fs';
import crypto from 'crypto';
import readline from 'readline';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load user config from ~/.config/wodev/.env
const userConfigDir = path.join(os.homedir(), '.config', 'wodev');
const userEnvPath = path.join(userConfigDir, '.env');
if (existsSync(userEnvPath)) {
  const envContent = readFileSync(userEnvPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

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
  console.log(`  ${o('│')}  ${C.bold}wodev${C.reset}              Electron app (default)             ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --web${C.reset}         Web server (production)            ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --dev${C.reset}         Dev server (hot reload, web)       ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --build${C.reset}       Build for production               ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --update${C.reset}      Update to latest npm version       ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --uninstall${C.reset}    Remove dashboard globally           ${o('│')}`);
  console.log(`  ${o('│')}  ${C.bold}wodev --setup${C.reset}       Configure GitHub OAuth credentials  ${o('│')}`);
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

function uninstallDashboard() {
  printLogo();
  console.log(`  ${ob('⟡ UNINSTALL')}  ${od('removing dashboard')}  ${od('─'.repeat(14))}`);
  console.log();
  try {
    execSync('npm uninstall -g @wayofmono/wo-cto-dashboard', { stdio: 'inherit' });
    console.log(`  ${green('✓')} ${C.bold}Dashboard uninstalled${C.reset}`);
  } catch {
    console.log();
    console.log(`  ${yellow('⚠')}  Could not uninstall automatically.`);
    if (isWin) {
      console.log(`     ${od('Try running as Administrator.')}`);
    } else {
      console.log(`     ${od('Try:')} ${C.bold}sudo npm uninstall -g @wayofmono/wo-cto-dashboard${C.reset}`);
    }
  }
  console.log();
}

function setupDashboard() {
  printLogo();
  console.log(`  ${ob('⟡ SETUP')}  ${od('configure GitHub OAuth')}  ${od('─'.repeat(13))}`);
  console.log();
  console.log(`  ${od('Pre-configured with Way-Of org OAuth — just run wodev and sign in with GitHub.')}`);
  console.log();
  console.log(`  ${od('Use --setup only if you need a custom OAuth App for your own org:')}`);
  console.log();
  console.log(`  ${C.bold}  1)${C.reset}  Open ${cyan('https://github.com/settings/developers')} → "New OAuth App"`);
  console.log(`     ${od('App name:')} ${C.bold}WayOfDev CTO Dashboard${C.reset}  ${od('·')}  ${od('Callback:')} ${cyan('http://localhost:6969/api/auth/callback/github')}`);
  console.log(`     ${od('Homepage:')} ${cyan('http://localhost:6969')}`);
  console.log();
  console.log(`  ${C.bold}  2)${C.reset}  Copy the ${yellow('Client ID')} and ${yellow('Client Secret')}, paste below:`);
  console.log();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (q) => new Promise(r => rl.question(`  ${ob('?')} ${q}: `, r));

  (async () => {
    const clientId = await ask('GitHub Client ID');
    const clientSecret = await ask('GitHub Client Secret');
    rl.close();

    if (!clientId || !clientSecret) {
      console.log(`\n  ${yellow('⚠')}  Both fields required. Setup cancelled.`);
      process.exit(1);
    }

    try {
      mkdirSync(userConfigDir, { recursive: true });
      appendFileSync(userEnvPath, `\n# GitHub OAuth (added by wodev --setup)\nGITHUB_CLIENT_ID=${clientId}\nGITHUB_CLIENT_SECRET=${clientSecret}\n`);
      console.log(`\n  ${green('✓')} ${C.bold}Saved to ${userEnvPath}${C.reset}`);
    } catch (e) {
      console.log(`\n  ${red('✗')} Failed to write config: ${e.message}`);
    }
    process.exit(0);
  })();
}

function runNext(cmd, extraArgs = []) {
  const port = process.env.PORT || '6969';

  printLogo();
  console.log(`  ${ob('⟡ ' + (cmd === 'dev' ? 'DEV SERVER' : cmd === 'build' ? 'BUILD' : 'PRODUCTION'))}  ${od('port ' + port)}  ${od('─'.repeat(20))}`);
  console.log();

  if (cmd !== 'build') {
    const messages = [
      `${od('🤖')}  ${C.bold}Yo! I\'m Wodev — your deploy dashboard.${C.reset}  ${od('I know all your builds, tickets, and deploys. Just don\'t ask me to code.')}`,
      `${od('🔥')}  ${C.bold}Wodev here.${C.reset}  ${od('Your PR queue is glowing. Your tickets are waiting. Your builds are... well, let\'s check.')}`,
      `${od('🎩')}  ${C.bold}Ah, the CTO arrives.${C.reset}  ${od('I\'ve kept the seat warm. Tickets: still open. Builds: let\'s find out if they passed.')}`,
      `${od('☕')}  ${C.bold}Wodev online.${C.reset}  ${od('I handle the deploys so you can handle the important stuff. Like naming that branch.')}`,
      `${od('🚀')}  ${C.bold}Ship it!${C.reset}  ${od('Oh wait, that\'s my line. Wodev ready — point me at a build.')}`,
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    console.log(`  ${msg}`);
    console.log();
  }

  // Fixed NEXTAUTH_SECRET - MUST MATCH v0.4.21 SECRET for old cookie decryption
  // This is SHA256("wo-cto-dashboard-0.4.21") - the last working version
  // NEVER CHANGE THIS or old cookies will fail to decrypt
  const fixedSecret = '68870c1363f4721bf3a154d3e524b54a34ac5eb683e4d7dc53c426edc10e41d7';

  const env = {
    ...process.env,
    PORT: port,
    NODE_ENV: cmd === 'dev' ? 'development' : 'production',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || fixedSecret,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'Ov23liy3r3AGOFaXT6YV',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '9a6410416575e390ac9253a41f64a8a46af7d7a5',
  };

  // Pre-build steps for global installs
  if (cmd === 'build') {
    try {
      const prismaBin = createRequire(import.meta.url).resolve('prisma/build/index.js');
      execSync(`node "${prismaBin}" generate`, { cwd: projectRoot, stdio: 'pipe' });
    } catch {
      try {
        execSync('npx --yes prisma generate', { cwd: projectRoot, stdio: 'pipe' });
      } catch {}
    }
  }

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
    // After build, ensure .next/ is world-readable (sudo installs make files root-owned)
    if (cmd === 'build' && (code === 0 || code === null)) {
      try {
        execSync(`chmod -R o+rX "${path.join(projectRoot, '.next')}"`, { stdio: 'ignore' });
      } catch {}
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

function runElectron(isDev = false) {
  const electronBin = path.join(projectRoot, 'node_modules', '.bin', 'electron');
  const mainPath = path.join(projectRoot, 'electron', isDev ? 'main.ts' : 'main.js');
  const port = process.env.PORT || '6969';

  printLogo();
  console.log(`  ${ob('⟡ ELECTRON APP')}  ${od(isDev ? 'development' : 'production')}  ${od('─'.repeat(18))}`);
  console.log();

  // Fixed NEXTAUTH_SECRET - MUST MATCH v0.4.21 SECRET for old cookie decryption
  const fixedSecret = '68870c1363f4721bf3a154d3e524b54a34ac5eb683e4d7dc53c426edc10e41d7';

  const env = {
    ...process.env,
    PORT: port,
    NODE_ENV: isDev ? 'development' : 'production',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || fixedSecret,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'Ov23liy3r3AGOFaXT6YV',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '9a6410416575e390ac9253a41f64a8a46af7d7a5',
  };

  const child = spawn(isDev ? 'bun' : electronBin, isDev ? ['dev'] : [mainPath], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`  ${red('✗')} Failed to start Electron: ${err.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`  ${red('✗')} Electron exited with code ${code}`);
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

if (args.includes('--uninstall')) {
  uninstallDashboard();
  process.exit(0);
}

const useWeb = args.includes('--web') || args.includes('-w');

if (args.includes('--setup')) {
  setupDashboard();
} else if (args.includes('--build') || args.includes('-b')) {
  runNext('build');
} else if (args.includes('--dev') || args.includes('-d')) {
  runNext('dev', ['--turbopack']);
} else {
  const nextDir = path.join(projectRoot, '.next');
  try {
    accessSync(nextDir, constants.R_OK);
  } catch {
    printLogo();
    const msgs = [
      `${od('🤖')}  ${C.bold}Yo! I\'m Wodev — your deploy dashboard.${C.reset}  ${od('I know all your builds, tickets, and deploys. Just don\'t ask me to code.')}`,
      `${od('🔥')}  ${C.bold}Wodev here.${C.reset}  ${od('Your PR queue is glowing. Your tickets are waiting. Your builds are... well, let\'s check.')}`,
      `${od('🎩')}  ${C.bold}Ah, the CTO arrives.${C.reset}  ${od('I\'ve kept the seat warm. Tickets: still open. Builds: let\'s find out if they passed.')}`,
      `${od('☕')}  ${C.bold}Wodev online.${C.reset}  ${od('I handle the deploys so you can handle the important stuff. Like naming that branch.')}`,
      `${od('🚀')}  ${C.bold}Ship it!${C.reset}  ${od('Oh wait, that\'s my line. Wodev ready — point me at a build.')}`,
    ];
    console.log(`  ${msgs[Math.floor(Math.random() * msgs.length)]}`);
    console.log();
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
  if (useWeb) {
    runNext('start');
  } else {
    runElectron(false);
  }
}
