import { existsSync } from "node:fs";
import { spawn } from "child_process";
import { type Static, Type } from "typebox";
import type { ToolDefinition } from "@wayofmono/wo-agent-core";
import { waitForChildProcess } from "../utils/child-process.js";
import {
	getShellConfig,
	getShellEnv,
	killProcessTree,
	trackDetachedChildPid,
	untrackDetachedChildPid,
} from "../utils/shell.js";
import { OutputAccumulator } from "./output-accumulator.js";
import { DEFAULT_MAX_BYTES, DEFAULT_MAX_LINES, formatSize, type TruncationResult } from "./truncate.js";

const bashSchema = Type.Object({
	command: Type.String({ description: "Bash command to execute" }),
	timeout: Type.Optional(Type.Number({ description: "Timeout in seconds (optional, no default timeout)" })),
});

export type BashToolInput = Static<typeof bashSchema>;

export interface BashToolDetails {
	truncation?: TruncationResult;
	fullOutputPath?: string;
}

/**
 * Pluggable operations for the bash tool.
 * Override these to delegate command execution to remote systems (for example SSH).
 */
export interface BashOperations {
	exec: (
		command: string,
		cwd: string,
		options: {
			onData: (data: Buffer) => void;
			signal?: AbortSignal;
			timeout?: number;
			env?: NodeJS.ProcessEnv;
		},
	) => Promise<{ exitCode: number | null }>;
}

export function createLocalBashOperations(options?: { shellPath?: string }): BashOperations {
	return {
		exec: (command, cwd, { onData, signal, timeout, env }) => {
			return new Promise((resolve, reject) => {
				const { shell, args } = getShellConfig(options?.shellPath);
				if (!existsSync(cwd)) {
					reject(new Error(`Working directory does not exist: ${cwd}\nCannot execute bash commands.`));
					return;
				}
				const child = spawn(shell, [...args, command], {
					cwd,
					detached: process.platform !== "win32",
					env: env ?? getShellEnv(),
					stdio: ["ignore", "pipe", "pipe"],
				});
				if (child.pid) trackDetachedChildPid(child.pid);
				let timedOut = false;
				let timeoutHandle: NodeJS.Timeout | undefined;
				if (timeout !== undefined && timeout > 0) {
					timeoutHandle = setTimeout(() => {
						timedOut = true;
						if (child.pid) killProcessTree(child.pid);
					}, timeout * 1000);
				}
				child.stdout?.on("data", onData);
				child.stderr?.on("data", onData);
				const onAbort = () => {
					if (child.pid) killProcessTree(child.pid);
				};
				if (signal) {
					if (signal.aborted) onAbort();
					else signal.addEventListener("abort", onAbort, { once: true });
				}
				waitForChildProcess(child)
					.then((code) => {
						if (child.pid) untrackDetachedChildPid(child.pid);
						if (timeoutHandle) clearTimeout(timeoutHandle);
						if (signal) signal.removeEventListener("abort", onAbort);
						if (signal?.aborted) {
							reject(new Error("aborted"));
							return;
						}
						if (timedOut) {
							reject(new Error(`timeout:${timeout}`));
							return;
						}
						resolve({ exitCode: code });
					})
					.catch((err) => {
						if (child.pid) untrackDetachedChildPid(child.pid);
						if (timeoutHandle) clearTimeout(timeoutHandle);
						if (signal) signal.removeEventListener("abort", onAbort);
						reject(err);
					});
			});
		},
	};
}

export interface BashSpawnContext {
	command: string;
	cwd: string;
	env: NodeJS.ProcessEnv;
}

export type BashSpawnHook = (context: BashSpawnContext) => BashSpawnContext;

function resolveSpawnContext(command: string, cwd: string, spawnHook?: BashSpawnHook): BashSpawnContext {
	const baseContext: BashSpawnContext = { command, cwd, env: { ...getShellEnv() } };
	return spawnHook ? spawnHook(baseContext) : baseContext;
}

export interface BashToolOptions {
	operations?: BashOperations;
	commandPrefix?: string;
	shellPath?: string;
	spawnHook?: BashSpawnHook;
}

const BASH_UPDATE_THROTTLE_MS = 100;

export function createBashToolDefinition(
	cwd: string,
	options?: BashToolOptions,
): ToolDefinition {
	const ops = options?.operations ?? createLocalBashOperations({ shellPath: options?.shellPath });
	const commandPrefix = options?.commandPrefix;
	const spawnHook = options?.spawnHook;
	return {
		name: "bash",
		description: `Execute a bash command in the current working directory. Returns stdout and stderr. Output is truncated to last ${DEFAULT_MAX_LINES} lines or ${DEFAULT_MAX_BYTES / 1024}KB (whichever is hit first). If truncated, full output is saved to a temp file. Optionally provide a timeout in seconds.`,
		promptSnippet: "Execute bash commands (ls, grep, find, etc.)",
		parameters: bashSchema,
		async execute(
			_toolCallId,
			params: Record<string, unknown>,
			signal?: AbortSignal,
			onUpdate?: (update: { content: Array<{ type: string; text: string }>; details?: Record<string, unknown> }) => void,
			_ctx?: unknown,
		) {
			const { command, timeout } = params as { command: string; timeout?: number };
			const resolvedCommand = commandPrefix ? `${commandPrefix}\n${command}` : command;
			const spawnContext = resolveSpawnContext(resolvedCommand, cwd, spawnHook);
			const output = new OutputAccumulator({ tempFilePrefix: "wo-bash" });
			let updateTimer: NodeJS.Timeout | undefined;
			let updateDirty = false;
			let lastUpdateAt = 0;

			const emitOutputUpdate = () => {
				if (!onUpdate || !updateDirty) return;
				updateDirty = false;
				lastUpdateAt = Date.now();
				const snapshot = output.snapshot({ persistIfTruncated: true });
				onUpdate({
					content: [{ type: "text", text: snapshot.content || "" }],
					details: {
						truncation: snapshot.truncation.truncated ? snapshot.truncation : undefined,
						fullOutputPath: snapshot.fullOutputPath,
					} as Record<string, unknown>,
				});
			};

			const clearUpdateTimer = () => {
				if (updateTimer) {
					clearTimeout(updateTimer);
					updateTimer = undefined;
				}
			};

			const scheduleOutputUpdate = () => {
				if (!onUpdate) return;
				updateDirty = true;
				const delay = BASH_UPDATE_THROTTLE_MS - (Date.now() - lastUpdateAt);
				if (delay <= 0) {
					clearUpdateTimer();
					emitOutputUpdate();
					return;
				}
				updateTimer ??= setTimeout(() => {
					updateTimer = undefined;
					emitOutputUpdate();
				}, delay);
			};

			if (onUpdate) {
				onUpdate({ content: [], details: undefined });
			}

			const handleData = (data: Buffer) => {
				output.append(data);
				scheduleOutputUpdate();
			};

			const finishOutput = async () => {
				output.finish();
				clearUpdateTimer();
				emitOutputUpdate();
				const snapshot = output.snapshot({ persistIfTruncated: true });
				await output.closeTempFile();
				return snapshot;
			};

			const formatOutput = (snapshot: Awaited<ReturnType<typeof finishOutput>>, emptyText = "(no output)") => {
				const truncation = snapshot.truncation;
				let text = snapshot.content || emptyText;
				let details: Record<string, unknown> | undefined;
				if (truncation.truncated) {
					details = { truncation, fullOutputPath: snapshot.fullOutputPath };
					const startLine = truncation.totalLines - truncation.outputLines + 1;
					const endLine = truncation.totalLines;
					if (truncation.lastLinePartial) {
						const lastLineSize = formatSize(output.getLastLineBytes());
						text += `\n\n[Showing last ${formatSize(truncation.outputBytes)} of line ${endLine} (line is ${lastLineSize}). Full output: ${snapshot.fullOutputPath}]`;
					} else if (truncation.truncatedBy === "lines") {
						text += `\n\n[Showing lines ${startLine}-${endLine} of ${truncation.totalLines}. Full output: ${snapshot.fullOutputPath}]`;
					} else {
						text += `\n\n[Showing lines ${startLine}-${endLine} of ${truncation.totalLines} (${formatSize(DEFAULT_MAX_BYTES)} limit). Full output: ${snapshot.fullOutputPath}]`;
					}
				}
				return { text, details };
			};

			const appendStatus = (text: string, status: string) => `${text ? `${text}\n\n` : ""}${status}`;

			try {
				let exitCode: number | null;
				try {
					const result = await ops.exec(spawnContext.command, spawnContext.cwd, {
						onData: handleData,
						signal,
						timeout,
						env: spawnContext.env,
					});
					exitCode = result.exitCode;
				} catch (err) {
					const snapshot = await finishOutput();
					const { text } = formatOutput(snapshot, "");
					if (err instanceof Error && err.message === "aborted") {
						throw new Error(appendStatus(text, "Command aborted"));
					}
					if (err instanceof Error && err.message.startsWith("timeout:")) {
						const timeoutSecs = err.message.split(":")[1];
						throw new Error(appendStatus(text, `Command timed out after ${timeoutSecs} seconds`));
					}
					throw err;
				}

				const snapshot = await finishOutput();
				const { text: outputText, details } = formatOutput(snapshot);
				if (exitCode !== 0 && exitCode !== null) {
					throw new Error(appendStatus(outputText, `Command exited with code ${exitCode}`));
				}
				return { content: [{ type: "text", text: outputText }], details };
			} finally {
				clearUpdateTimer();
			}
		},
	};
}

export function createBashTool(cwd: string, options?: BashToolOptions): ToolDefinition {
	return createBashToolDefinition(cwd, options);
}
