import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const moduleUrl = new URL("../gemini-web-config.ts", import.meta.url).href;

function runCookieAccessCheck(home, extraEnv = {}) {
	const env = { ...process.env, HOME: home, USERPROFILE: home, ...extraEnv };
	delete env.WO_ALLOW_BROWSER_COOKIES;
	Object.assign(env, extraEnv);

	return spawnSync(process.execPath, ["--input-type=module"], {
		input: `const { isBrowserCookieAccessAllowed } = await import(${JSON.stringify(moduleUrl)}); console.log(String(isBrowserCookieAccessAllowed()));`,
		encoding: "utf8",
		env,
	});
}

test("browser cookie access is disabled unless explicitly allowed", async () => {
	const home = await mkdtemp(join(tmpdir(), "wo-web-access-cookie-opt-in-"));

	let child = runCookieAccessCheck(home);
	assert.equal(child.status, 0, child.stderr);
	assert.equal(child.stdout.trim(), "false");

	await mkdir(join(home, ".wo"), { recursive: true });
	await writeFile(join(home, ".wo", "web-search.json"), JSON.stringify({ allowBrowserCookies: true }) + "\n", "utf8");

	child = runCookieAccessCheck(home);
	assert.equal(child.status, 0, child.stderr);
	assert.equal(child.stdout.trim(), "true");

	const envHome = await mkdtemp(join(tmpdir(), "wo-web-access-cookie-env-"));
	child = runCookieAccessCheck(envHome, { WO_ALLOW_BROWSER_COOKIES: "1" });
	assert.equal(child.status, 0, child.stderr);
	assert.equal(child.stdout.trim(), "true");
});
