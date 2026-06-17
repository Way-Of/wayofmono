import { type DetectResult, type ArchInfo } from "./types.ts";

export function detectArch(): DetectResult<ArchInfo> {
  try {
    const raw = Deno.build.arch;
    let arch: ArchInfo["arch"];
    if (raw === "x86_64") arch = "x86_64";
    else if (raw === "aarch64") arch = "aarch64";
    else if (raw === "arm64") arch = "arm64";
    else if (raw === "i386" || raw === "i686") arch = "i386";
    else arch = "unknown";

    return {
      value: { arch, is64bit: arch !== "i386" },
      confidence: "high",
      source: `Deno.build.arch: ${raw}`,
    };
  } catch (err) {
    return {
      value: { arch: "x86_64", is64bit: true },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
