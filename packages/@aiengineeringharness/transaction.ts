import { type OsInfo, type DesktopInfo, type DetectResult } from "./detect/types.ts";
import { resolvePlatformPaths, lockFilePath, sentinelPath } from "./adapt/paths.ts";

function isProcessAlive(pid: number): boolean {
  try {
    if (Deno.build.os === "linux") {
      // Check if /proc/<pid> exists — cheapest cross-check
      Deno.statSync(`/proc/${pid}/stat`);
      return true;
    }
    // macOS/others: send signal 0 via SIGCONT; if process doesn't exist, throws
    Deno.kill(pid, "SIGCONT");
    return true;
  } catch {
    return false;
  }
}

interface Operation {
  type: "write" | "mkdir" | "symlink" | "download" | "remove";
  path: string;
  rollback?: () => void;
}

export class Transaction {
  private operations: Operation[] = [];
  private committed = false;
  private lockFile: string | null = null;
  private lockFd: Deno.FsFile | null = null;

  constructor(private osResult: DetectResult<OsInfo>, private desktopResult: DetectResult<DesktopInfo>) {}

  addWrite(path: string, content: string): void {
    this.operations.push({
      type: "write",
      path,
      rollback: () => {
        try { Deno.removeSync(path); } catch {}
      },
    });
  }

  addMkdir(path: string): void {
    this.operations.push({
      type: "mkdir",
      path,
      rollback: () => {
        try { Deno.removeSync(path); } catch {}
      },
    });
  }

  addDownload(path: string): void {
    this.operations.push({
      type: "download",
      path,
      rollback: () => {
        try { Deno.removeSync(path); } catch {}
      },
    });
  }

  addRemove(path: string): void {
    this.operations.push({
      type: "remove",
      path,
      rollback: undefined,
    });
  }

  async acquireLock(timeoutMs = 30000): Promise<boolean> {
    const paths = resolvePlatformPaths(this.osResult, this.desktopResult);
    this.lockFile = lockFilePath(paths.stateDir);

    try {
      Deno.mkdirSync(paths.stateDir, { recursive: true });
    } catch {}

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const fd = Deno.openSync(this.lockFile, {
          write: true,
          createNew: true,
          mode: 0o644,
        });
        Deno.writeTextFileSync(this.lockFile, String(Deno.pid));
        this.lockFd = fd;
        return true;
      } catch {
        // Lock held by another process (or stale)
        try {
          const pid = parseInt(Deno.readTextFileSync(this.lockFile).trim());
          if (!isProcessAlive(pid)) {
            // Stale lock from a dead process — remove and retry
            try { Deno.removeSync(this.lockFile); } catch {}
            continue;
          }
          console.log(`  ${"\x1b[38;5;226m\u26a0\x1b[0m"} Install lock held by PID ${pid}, waiting...`);
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    return false;
  }

  releaseLock(): void {
    if (this.lockFd !== null) {
      try { this.lockFd.close(); } catch {}
      this.lockFd = null;
    }
    if (this.lockFile) {
      try { Deno.removeSync(this.lockFile); } catch {}
    }
  }

  commit(): void {
    this.committed = true;
    this.releaseLock();
  }

  rollback(): void {
    if (this.committed) return;
    console.log(`  ${"\x1b[38;5;196m\u2717\x1b[0m"} Install failed — rolling back...`);
    for (const op of [...this.operations].reverse()) {
      if (op.rollback) {
        try { op.rollback(); } catch {}
      }
    }
    this.releaseLock();
  }

  writeSentinel(version: string): void {
    const paths = resolvePlatformPaths(this.osResult, this.desktopResult);
    try {
      Deno.mkdirSync(paths.stateDir, { recursive: true });
      Deno.writeTextFileSync(sentinelPath(paths.stateDir), `version=${version}\ndate=${new Date().toISOString()}\n`);
    } catch {}
  }

  removeSentinel(): void {
    const paths = resolvePlatformPaths(this.osResult, this.desktopResult);
    try {
      Deno.removeSync(sentinelPath(paths.stateDir));
    } catch {}
  }

  isPreviouslyInstalled(): boolean {
    const paths = resolvePlatformPaths(this.osResult, this.desktopResult);
    try {
      Deno.statSync(sentinelPath(paths.stateDir));
      return true;
    } catch {
      return false;
    }
  }
}
