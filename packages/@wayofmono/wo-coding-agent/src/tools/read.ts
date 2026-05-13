import type { ToolDefinition } from "@wayofmono/wo-agent-core";
import { constants } from "fs";
import { access as fsAccess, readFile as fsReadFile } from "fs/promises";
import { type Static, Type } from "typebox";
import { detectSupportedImageMimeTypeFromFile } from "../utils/mime.js";
import { resolveReadPath } from "./path-utils.js";
import { DEFAULT_MAX_BYTES, formatSize, type TruncationResult, truncateHead } from "./truncate.js";

const readSchema = Type.Object({
	path: Type.String({ description: "Path to the file to read (relative or absolute)" }),
	offset: Type.Optional(Type.Number({ description: "Line number to start reading from (1-indexed)" })),
	limit: Type.Optional(Type.Number({ description: "Maximum number of lines to read" })),
});

export type ReadToolInput = Static<typeof readSchema>;

export interface ReadToolDetails {
	truncation?: TruncationResult;
}

/**
 * Pluggable operations for the read tool.
 */
export interface ReadOperations {
	readFile: (absolutePath: string) => Promise<Buffer>;
	access: (absolutePath: string) => Promise<void>;
	detectImageMimeType?: (absolutePath: string) => Promise<string | null | undefined>;
}

const defaultReadOperations: ReadOperations = {
	readFile: (path) => fsReadFile(path),
	access: (path) => fsAccess(path, constants.R_OK),
	detectImageMimeType: detectSupportedImageMimeTypeFromFile,
};

export interface ReadToolOptions {
	autoResizeImages?: boolean;
	operations?: ReadOperations;
}

export function createReadToolDefinition(
	cwd: string,
	options?: ReadToolOptions,
): ToolDefinition {
	const ops = options?.operations ?? defaultReadOperations;
	return {
		name: "read",
		description: `Read the contents of a file. Supports text files and images (jpg, png, gif, webp). For text files, output is truncated to ${DEFAULT_MAX_BYTES / 1024}KB. Use offset/limit for large files. When you need the full file, continue with offset until complete.`,
		promptSnippet: "Read file contents",
		promptGuidelines: ["Use read to examine files instead of cat or sed."],
		parameters: readSchema,
		async execute(
			_toolCallId,
			params: Record<string, unknown>,
			signal?: AbortSignal,
			_onUpdate?: unknown,
			ctx?: unknown,
		) {
			const { path, offset, limit } = params as { path: string; offset?: number; limit?: number };
			const absolutePath = resolveReadPath(path, cwd);
			return new Promise<{ content: Array<{ type: string; text: string }>; details?: Record<string, unknown> }>(
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
							await ops.access(absolutePath);
							if (aborted) return;
							const mimeType = ops.detectImageMimeType ? await ops.detectImageMimeType(absolutePath) : undefined;
							let content: Array<{ type: string; text: string }>;
							let details: Record<string, unknown> | undefined;
							if (mimeType) {
								content = [{ type: "text", text: `Read image file [${mimeType}]. The image cannot be transmitted to the model in this format.` }];
							} else {
								const buffer = await ops.readFile(absolutePath);
								const textContent = buffer.toString("utf-8");
								const allLines = textContent.split("\n");
								const totalFileLines = allLines.length;
								const startLine = offset ? Math.max(0, offset - 1) : 0;
								const startLineDisplay = startLine + 1;
								if (startLine >= allLines.length) {
									throw new Error(`Offset ${offset} is beyond end of file (${allLines.length} lines total)`);
								}
								let selectedContent: string;
								let userLimitedLines: number | undefined;
								if (limit !== undefined) {
									const endLine = Math.min(startLine + limit, allLines.length);
									selectedContent = allLines.slice(startLine, endLine).join("\n");
									userLimitedLines = endLine - startLine;
								} else {
									selectedContent = allLines.slice(startLine).join("\n");
								}
								const truncation = truncateHead(selectedContent);
								let outputText: string;
								if (truncation.firstLineExceedsLimit) {
									const firstLineSize = formatSize(Buffer.byteLength(allLines[startLine], "utf-8"));
									outputText = `[Line ${startLineDisplay} is ${firstLineSize}, exceeds ${formatSize(DEFAULT_MAX_BYTES)} limit. Use bash: sed -n '${startLineDisplay}p' ${path} | head -c ${DEFAULT_MAX_BYTES}]`;
									details = { truncation };
								} else if (truncation.truncated) {
									const endLineDisplay = startLineDisplay + truncation.outputLines - 1;
									const nextOffset = endLineDisplay + 1;
									outputText = truncation.content;
									if (truncation.truncatedBy === "lines") {
										outputText += `\n\n[Showing lines ${startLineDisplay}-${endLineDisplay} of ${totalFileLines}. Use offset=${nextOffset} to continue.]`;
									} else {
										outputText += `\n\n[Showing lines ${startLineDisplay}-${endLineDisplay} of ${totalFileLines} (${formatSize(DEFAULT_MAX_BYTES)} limit). Use offset=${nextOffset} to continue.]`;
									}
									details = { truncation };
								} else if (userLimitedLines !== undefined && startLine + userLimitedLines < allLines.length) {
									const remaining = allLines.length - (startLine + userLimitedLines);
									const nextOffset = startLine + userLimitedLines + 1;
									outputText = `${truncation.content}\n\n[${remaining} more lines in file. Use offset=${nextOffset} to continue.]`;
								} else {
									outputText = truncation.content;
								}
								content = [{ type: "text", text: outputText }];
							}

							if (aborted) return;
							signal?.removeEventListener("abort", onAbort);
							resolve({ content, details });
						} catch (error: any) {
							signal?.removeEventListener("abort", onAbort);
							if (!aborted) reject(error);
						}
					})();
				},
			);
		},
	};
}

export function createReadTool(cwd: string, options?: ReadToolOptions): ToolDefinition {
	return createReadToolDefinition(cwd, options);
}
