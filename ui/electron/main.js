// electron/main.ts
import { app, BrowserWindow, ipcMain, shell, nativeTheme } from "electron";
import { join } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
var __dirname = join(fileURLToPath(import.meta.url), "..");
var isDev = !app.isPackaged && process.env.NODE_ENV !== "production";
var mainWindow = null;
var nextServer = null;
var serverReady = false;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 600,
    title: "WayOfMono CTO Dashboard",
    icon: join(__dirname, "..", "public", "favicon.ico"),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    autoHideMenuBar: true,
    show: false,
    backgroundColor: "#0f172a"
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  if (isDev) {
    startNextDevServer().then(() => {
      mainWindow?.loadURL("http://localhost:6969");
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    });
  } else {
    startNextProdServer().then(() => {
      mainWindow?.loadURL("http://localhost:6969");
    });
  }
}
async function startNextDevServer() {
  return new Promise((resolve) => {
    nextServer = spawn("bun", ["dev"], {
      cwd: join(__dirname, ".."),
      env: { ...process.env, PORT: "6969", NODE_ENV: "development" },
      stdio: ["ignore", "pipe", "pipe"],
      shell: true
    });
    nextServer.stdout?.on("data", (data) => {
      const output = data.toString();
      console.log(`[Next.js] ${output}`);
      if (!serverReady && (output.includes("Ready in") || output.includes("started on") || output.includes("Local:"))) {
        serverReady = true;
        setTimeout(resolve, 1e3);
      }
    });
    nextServer.stderr?.on("data", (data) => {
      console.error(`[Next.js Error] ${data}`);
    });
    nextServer.on("close", (code) => {
      console.log(`Next.js server exited with code ${code}`);
      nextServer = null;
      serverReady = false;
    });
  });
}
async function startNextProdServer() {
  return new Promise((resolve) => {
    const nextBin = join(__dirname, "..", "node_modules", ".bin", "next");
    nextServer = spawn(nextBin, ["start"], {
      cwd: join(__dirname, ".."),
      env: { ...process.env, PORT: "6969", NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    nextServer.stdout?.on("data", (data) => {
      const output = data.toString();
      console.log(`[Next.js] ${output}`);
      if (!serverReady && (output.includes("Ready in") || output.includes("started on") || output.includes("Local:"))) {
        serverReady = true;
        setTimeout(resolve, 1e3);
      }
    });
    nextServer.stderr?.on("data", (data) => {
      console.error(`[Next.js Error] ${data}`);
    });
    nextServer.on("close", (code) => {
      console.log(`Next.js server exited with code ${code}`);
      nextServer = null;
      serverReady = false;
    });
  });
}
app.whenReady().then(() => {
  nativeTheme.themeSource = "dark";
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (nextServer) {
    nextServer.kill("SIGTERM");
  }
  if (process.platform !== "darwin") app.quit();
});
app.on("before-quit", () => {
  if (nextServer) {
    nextServer.kill("SIGTERM");
  }
});
ipcMain.handle("sync-f\xF6rr\xE5d", async () => {
  const thoughtsDir = join(__dirname, "..", "..", "..", "thoughts");
  return new Promise((resolve) => {
    const child = spawn("git", ["pull", "--ff-only"], {
      cwd: thoughtsDir,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout.trim() || "Already up to date." });
      } else {
        resolve({ success: false, output: stdout.trim(), error: stderr.trim() || `Git exited with code ${code}` });
      }
    });
    child.on("error", (err) => {
      resolve({ success: false, output: "", error: err.message });
    });
  });
});
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});
ipcMain.handle("get-platform", () => {
  return process.platform;
});
