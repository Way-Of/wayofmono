/**
 * Vitest globalSetup hook.
 *
 * We only publish the shared worker-root env var here. Teardown is intentionally
 * a no-op because deleting shared temp roots during teardown can race with
 * still-running suites in some Vitest pool modes and trigger uv_cwd failures.
 * Worker dirs are cleaned by vitest-setup.ts on process exit.
 */

import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKER_ROOT = join(tmpdir(), "fusion-test-workers");

export default function setup(): () => Promise<void> {
  // Set the env var here too so vitest-setup.ts workers pick it up even if
  // their own mkdir runs after globalSetup.
  process.env.FUSION_TEST_WORKER_ROOT = WORKER_ROOT;

  return async function teardown() {
    // Intentionally no-op.
    //
    // Worker temp dirs are cleaned by vitest-setup.ts using process.on("exit")
    // after first chdir-ing out of the worker dir. Deleting shared temp roots
    // from global teardown is unsafe under some Vitest pool modes because it
    // can run while other suites are still active, causing ENOENT uv_cwd.
  };
}
