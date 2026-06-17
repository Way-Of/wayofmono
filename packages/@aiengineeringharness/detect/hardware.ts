import { type DetectResult, type HardwareInfo } from "./types.ts";

export async function detectHardware(): Promise<DetectResult<HardwareInfo>> {
  try {
    let cpuCores = 1;
    let cpuModel: string | undefined;
    let ramGb = 1;
    let gpu: HardwareInfo["gpu"];
    let diskFreeGb = 1;
    let onBattery = false;

    const isLinux = Deno.build.os === "linux";
    const isMacos = Deno.build.os === "darwin";

    try {
      if (isLinux) {
        const cpuInfo = Deno.readTextFileSync("/proc/cpuinfo");
        const cores = cpuInfo.match(/^processor\s*:/gm);
        if (cores) cpuCores = cores.length;
        const modelMatch = cpuInfo.match(/^model name\s*:\s*(.+)$/m);
        if (modelMatch) cpuModel = modelMatch[1].trim();
      } else if (isMacos) {
        const cmd = new Deno.Command("sysctl", { args: ["-n", "hw.ncpu"] });
        const out = cmd.outputSync();
        if (out.success) cpuCores = parseInt(new TextDecoder().decode(out.stdout).trim()) || 1;
      }
    } catch {}

    try {
      if (isLinux) {
        const memInfo = Deno.readTextFileSync("/proc/meminfo");
        const match = memInfo.match(/^MemTotal:\s*(\d+)/m);
        if (match) ramGb = Math.round(parseInt(match[1]) / 1024 / 1024);
      } else if (isMacos) {
        const cmd = new Deno.Command("sysctl", { args: ["-n", "hw.memsize"] });
        const out = cmd.outputSync();
        if (out.success) ramGb = Math.round(parseInt(new TextDecoder().decode(out.stdout).trim()) / 1024 / 1024 / 1024);
      }
    } catch {}

    try {
      if (isLinux) {
        const stat = Deno.statSync("/");
        diskFreeGb = Math.round((stat.blksize ?? 4096) * (stat.blocks ?? 0) / 1024 / 1024 / 1024);
      }
    } catch {}

    try {
      if (isLinux) {
        const nvidiaCmd = new Deno.Command("nvidia-smi", { args: ["--query-gpu=name", "--format=csv,noheader"] });
        const nvOut = nvidiaCmd.outputSync();
        if (nvOut.success) {
          const name = new TextDecoder().decode(nvOut.stdout).trim().split("\n")[0];
          gpu = { vendor: "nvidia", name };
        }
      }
      if (!gpu) {
        if (isMacos) {
          gpu = { vendor: "apple" };
        } else if (isLinux) {
          try {
            const lspci = new Deno.Command("lspci", { args: [] });
            const lspciOut = lspci.outputSync();
            if (lspciOut.success) {
              const text = new TextDecoder().decode(lspciOut.stdout).toLowerCase();
              if (text.includes("amd") || text.includes("advanced micro devices")) gpu = { vendor: "amd" };
              else if (text.includes("intel")) gpu = { vendor: "intel" };
            }
          } catch {}
        }
      }
    } catch {}

    try {
      if (isLinux) {
        const powerDir = "/sys/class/power_supply";
        try {
          for await (const entry of Deno.readDir(powerDir)) {
            const statusPath = `${powerDir}/${entry.name}/status`;
            try {
              const status = Deno.readTextFileSync(statusPath).trim();
              if (status === "Discharging") { onBattery = true; break; }
            } catch {}
          }
        } catch {}
      }
    } catch {}

    return {
      value: { cpuCores, cpuModel, ramGb, gpu, diskFreeGb, onBattery },
      confidence: cpuCores > 1 ? "high" : "medium",
      source: "procfs + sysctl + nvidia-smi + lspci",
    };
  } catch (err) {
    return {
      value: { cpuCores: 1, ramGb: 1, diskFreeGb: 1, onBattery: false },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
