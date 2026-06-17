import { type DetectResult, type NetworkInfo } from "./types.ts";

export function detectNetwork(): DetectResult<NetworkInfo> {
  try {
    const httpProxy = Deno.env.get("HTTP_PROXY") || Deno.env.get("http_proxy");
    const httpsProxy = Deno.env.get("HTTPS_PROXY") || Deno.env.get("https_proxy");
    const noProxy = Deno.env.get("NO_PROXY") || Deno.env.get("no_proxy");

    const hasProxy = !!(httpProxy || httpsProxy);

    let githubToken = false;
    try {
      githubToken = !!(Deno.env.get("GITHUB_TOKEN") || Deno.env.get("GH_TOKEN"));
    } catch {}

    let isOffline = false;
    try {
      const cmd = new Deno.Command("ping", { args: ["-c", "1", "-W", "2", "8.8.8.8"] });
      const out = cmd.outputSync();
      isOffline = !out.success;
    } catch {
      isOffline = true;
    }

    let npmRegistry: string | undefined;
    try {
      const cmd = new Deno.Command("npm", { args: ["config", "get", "registry"] });
      const out = cmd.outputSync();
      if (out.success) {
        npmRegistry = new TextDecoder().decode(out.stdout).trim();
      }
    } catch {}

    return {
      value: { hasProxy, httpProxy, httpsProxy, noProxy, githubToken, isOffline, npmRegistry },
      confidence: "high",
      source: "env vars + ping + npm config",
    };
  } catch (err) {
    return {
      value: { hasProxy: false, githubToken: false, isOffline: true },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
