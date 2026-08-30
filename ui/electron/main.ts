import { app, BrowserWindow, ipcMain, shell, nativeTheme } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let nextServer: ChildProcess | null = null;
let serverReady = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'WayOfMono CTO Dashboard',
    icon: join(__dirname, '..', 'public', 'favicon.ico'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#0f172a',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    startNextDevServer().then(() => {
      mainWindow?.loadURL('http://localhost:3000');
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
    });
  } else {
    mainWindow.loadFile(join(__dirname, '..', '.next', 'standalone', 'index.html'));
  }
}

async function startNextDevServer(): Promise<void> {
  return new Promise((resolve) => {
    nextServer = spawn('bun', ['dev'], {
      cwd: join(__dirname, '..'),
      env: { ...process.env, PORT: '3000', NODE_ENV: 'development' },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    nextServer.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(`[Next.js] ${output}`);
      if (!serverReady && (output.includes('Ready in') || output.includes('started on') || output.includes('Local:'))) {
        serverReady = true;
        setTimeout(resolve, 1000);
      }
    });

    nextServer.stderr?.on('data', (data) => {
      console.error(`[Next.js Error] ${data}`);
    });

    nextServer.on('close', (code) => {
      console.log(`Next.js server exited with code ${code}`);
      nextServer = null;
      serverReady = false;
    });
  });
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill('SIGTERM');
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill('SIGTERM');
  }
});

ipcMain.handle('sync-förråd', async () => {
  const thoughtsDir = join(__dirname, '..', '..', '..', 'thoughts');

  return new Promise<{ success: boolean; output: string; error?: string }>((resolve) => {
    const child = spawn('git', ['pull', '--ff-only'], {
      cwd: thoughtsDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout.trim() || 'Already up to date.' });
      } else {
        resolve({ success: false, output: stdout.trim(), error: stderr.trim() || `Git exited with code ${code}` });
      }
    });

    child.on('error', (err) => {
      resolve({ success: false, output: '', error: err.message });
    });
  });
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});