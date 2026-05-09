/**
 * rpiv-args — Pi extension entry point.
 *
 * Registers the `input` event handler, a `before_agent_start` system-prompt
 * augmenter, and a `session_start` cache invalidator. All logic lives in
 * args.ts.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerArgsHandler } from "./args.js";

export default function (pi: ExtensionAPI): void {
	registerArgsHandler(pi);
}
