import type { ToolDefinition } from "@wayofmono/wo-agent-core";
import { constants } from "fs";
import { access as fsAccess, readFile as fsReadFile, writeFile as fsWriteFile } from "fs/promises";
import { type Static, Type } from "typebox";
import {
	applyEditsToNormalizedContent,
	computeEditsDiff,
	detectLineEnding,
	type Edit,
	generateDiffString,
	normalizeToLF,
	restoreLineEndings,
	stripBom,
} from "./edit-diff.js";
import { withFileMutationQueue } from "./file-mutation-queue.js";
import { resolveToCwd } from "./path-utils.js";

const replaceEditSchema = Type.Object(
	{
		oldText: Type.String({
			description:
				"Exact text for one targeted replacement. It must be unique in the original file and must not overlap with any other edits[].oldText in the same call.",
		}),
		newText: Type.String({ description: "Replacement text for this targeted edit." }),
	},
	{ additionalProperties: false },
);

const editSchema = Type.Object(
	{
		path: Type.String({ description: "Path to the file to edit (relative or absolute)" }),
		edits: Type.Array(replaceEditSchema, {
			description:
				"One or more targeted replacements. Each edit is matched against the original file, not incrementally. Do not include overlapping or nested edits. If two changes touch the same block or nearby lines, merge them into one edit instead.",
		}),
	},
	{ additionalProperties: false },
);

export type EditToolInput = Static<typeof editSchema>;

export interface EditToolDetails {
	diff: string;
	firstChangedLine?: number;
}

/**
 * Pluggable operations for the edit tool.
 * Override these to delegate file editing to remote systems (for example SSH).
 */
export interface EditOperations {
	readFile: (absolutePath: string) => Promise<Buffer>;
	writeFile: (absolutePath: string, content: string) => Promise<void>;
	access: (absolutePath: string) => Promise<void>;
}

const defaultEditOperations: EditOperations = {
	readFile: (path) => fsReadFile(path),
	writeFile: (path, content) => fsWriteFile(path, content, "utf-8"),
	access: (path) => fsAccess(path, constants.R_OK | constants.W_OK),
};

export interface EditToolOptions {
	operations?: EditOperations;
}

function prepareEditArguments(input: Record<string, unknown>): EditToolInput {
	if (!input || typeof input !== "object") {
		return input as unknown as EditToolInput;
	}

	const args = { ...input };

	if (typeof args.edits === "string") {
		try {
			const parsed = JSON.parse(args.edits as string);
			if (Array.isArray(parsed)) args.edits = parsed;
		} catch {}
	}

	const legacy = args as Record<string, unknown> & { oldText?: unknown; newText?: unknown };
	if (typeof legacy.oldText !== "string" || typeof legacy.newText !== "string") {
		return args as unknown as EditToolInput;
	}

	const edits = Array.isArray(args.edits) ? [...(args.edits as Edit[])] : [];
	edits.push({ oldText: legacy.oldText, newText: legacy.newText });
	const { oldText: _oldText, newText: _newText, ...rest } = legacy;
	return { ...rest, edits } as EditToolInput;
}

function validateEditInput(input: EditToolInput): { path: string; edits: Edit[] } {
	if (!Array.isArray(input.edits) || input.edits.length === 0) {
		throw new Error("Edit tool input is invalid. edits must contain at least one replacement.");
	}
	return { path: input.path, edits: input.edits };
}

export function createEditToolDefinition(
	cwd: string,
	options?: EditToolOptions,
): ToolDefinition {
	const ops = options?.operations ?? defaultEditOperations;
	return {
		name: "edit",
		description:
			"Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file. If two changes affect the same block or nearby lines, merge them into one edit instead of emitting overlapping edits. Do not include large unchanged regions just to connect distant changes.",
		promptSnippet:
			"Make precise file edits with exact text replacement, including multiple disjoint edits in one call",
		promptGuidelines: [
			"Use edit for precise changes (edits[].oldText must match exactly)",
			"When changing multiple separate locations in one file, use one edit call with multiple entries in edits[] instead of multiple edit calls",
			"Each edits[].oldText is matched against the original file, not after earlier edits are applied. Do not emit overlapping or nested edits. Merge nearby changes into one edit.",
			"Keep edits[].oldText as small as possible while still being unique in the file. Do not pad with large unchanged regions.",
		],
		parameters: editSchema,
		async execute(
			_toolCallId,
			params: Record<string, unknown>,
			signal?: AbortSignal,
			_onUpdate?: unknown,
			_ctx?: unknown,
		) {
			const input = prepareEditArguments(params);
			const { path, edits } = validateEditInput(input);
			const absolutePath = resolveToCwd(path, cwd);

			return withFileMutationQueue(
				absolutePath,
				() =>
					new Promise<{
						content: Array<{ type: "text"; text: string }>;
						details?: Record<string, unknown>;
					}>((resolve, reject) => {
						if (signal?.aborted) {
							reject(new Error("Operation aborted"));
							return;
						}

						let aborted = false;

						const onAbort = () => {
							aborted = true;
							reject(new Error("Operation aborted"));
						};

						if (signal) {
							signal.addEventListener("abort", onAbort, { once: true });
						}

						void (async () => {
							try {
								try {
									await ops.access(absolutePath);
								} catch (error: unknown) {
									const errorMessage =
										error instanceof Error && "code" in error ? `Error code: ${error.code}` : String(error);
									if (signal) {
										signal.removeEventListener("abort", onAbort);
									}
									reject(new Error(`Could not edit file: ${path}. ${errorMessage}.`));
									return;
								}

								if (aborted) {
									return;
								}

								const buffer = await ops.readFile(absolutePath);
								const rawContent = buffer.toString("utf-8");

								if (aborted) {
									return;
								}

								const { bom, text: content } = stripBom(rawContent);
								const originalEnding = detectLineEnding(content);
								const normalizedContent = normalizeToLF(content);
								const { baseContent, newContent } = applyEditsToNormalizedContent(
									normalizedContent,
									edits,
									path,
								);

								if (aborted) {
									return;
								}

								const finalContent = bom + restoreLineEndings(newContent, originalEnding);
								await ops.writeFile(absolutePath, finalContent);

								if (aborted) {
									return;
								}

								if (signal) {
									signal.removeEventListener("abort", onAbort);
								}

								const diffResult = generateDiffString(baseContent, newContent);
								resolve({
									content: [
										{
											type: "text",
											text: `Successfully replaced ${edits.length} block(s) in ${path}.`,
										},
									],
									details: { diff: diffResult.diff, firstChangedLine: diffResult.firstChangedLine } as Record<string, unknown>,
								});
							} catch (error: unknown) {
								if (signal) {
									signal.removeEventListener("abort", onAbort);
								}

								if (!aborted) {
									reject(error instanceof Error ? error : new Error(String(error)));
								}
							}
						})();
					}),
			);
		},
	};
}

export function createEditTool(cwd: string, options?: EditToolOptions): ToolDefinition {
	return createEditToolDefinition(cwd, options);
}
