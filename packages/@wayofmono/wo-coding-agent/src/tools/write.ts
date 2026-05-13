import type { ToolDefinition } from "@wayofmono/wo-agent-core";
import { mkdir as fsMkdir, writeFile as fsWriteFile } from "fs/promises";
import { dirname } from "path";
import { type Static, Type } from "typebox";
import { withFileMutationQueue } from "./file-mutation-queue.js";
import { resolveToCwd } from "./path-utils.js";

const writeSchema = Type.Object({
	path: Type.String({ description: "Path to the file to write (relative or absolute)" }),
	content: Type.String({ description: "Content to write to the file" }),
});

export type WriteToolInput = Static<typeof writeSchema>;

/**
 * Pluggable operations for the write tool.
 * Override these to delegate file writing to remote systems (for example SSH).
 */
export interface WriteOperations {
	writeFile: (absolutePath: string, content: string) => Promise<void>;
	mkdir: (dir: string) => Promise<void>;
}

const defaultWriteOperations: WriteOperations = {
	writeFile: (path, content) => fsWriteFile(path, content, "utf-8"),
	mkdir: (dir) => fsMkdir(dir, { recursive: true }).then(() => {}),
};

export interface WriteToolOptions {
	operations?: WriteOperations;
}

export function createWriteToolDefinition(
	cwd: string,
	options?: WriteToolOptions,
): ToolDefinition {
	const ops = options?.operations ?? defaultWriteOperations;
	return {
		name: "write",
		description:
			"Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories.",
		promptSnippet: "Create or overwrite files",
		promptGuidelines: ["Use write only for new files or complete rewrites."],
		parameters: writeSchema,
		async execute(
			_toolCallId,
			params: Record<string, unknown>,
			signal?: AbortSignal,
			_onUpdate?: unknown,
			_ctx?: unknown,
		) {
			const { path, content } = params as { path: string; content: string };
			const absolutePath = resolveToCwd(path, cwd);
			const dir = dirname(absolutePath);
			return withFileMutationQueue(
				absolutePath,
				() =>
					new Promise<{ content: Array<{ type: "text"; text: string }>; details: undefined }>(
						(resolve, reject) => {
							if (signal?.aborted) {
								reject(new Error("Operation aborted"));
								return;
							}
							let aborted = false;
							const onAbort = () => {
								aborted = true;
								reject(new Error("Operation aborted"));
							};
							signal?.addEventListener("abort", onAbort, { once: true });
							(async () => {
								try {
									await ops.mkdir(dir);
									if (aborted) return;
									await ops.writeFile(absolutePath, content);
									if (aborted) return;
									signal?.removeEventListener("abort", onAbort);
									resolve({
										content: [
											{ type: "text" as const, text: `Successfully wrote ${content.length} bytes to ${path}` },
										],
										details: undefined,
									});
								} catch (error: any) {
									signal?.removeEventListener("abort", onAbort);
									if (!aborted) reject(error);
								}
							})();
						},
					),
			);
		},
	};
}

export function createWriteTool(cwd: string, options?: WriteToolOptions): ToolDefinition {
	return createWriteToolDefinition(cwd, options);
}
