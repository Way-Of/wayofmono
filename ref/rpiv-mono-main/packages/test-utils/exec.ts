import { vi } from "vitest";

export interface GitExecSpec {
	branch?: string;
	commit?: string;
	user?: string;
	userError?: Error;
}

export interface ExecResult {
	stdout: string;
	stderr: string;
	exitCode: number;
}

export function stubGitExec(spec: GitExecSpec = {}) {
	return vi.fn(async (cmd: string, args: string[], _opts?: unknown): Promise<ExecResult> => {
		if (cmd !== "git") return { stdout: "", stderr: "", exitCode: 0 };
		const joined = args.join(" ");
		if (joined === "rev-parse --abbrev-ref HEAD") {
			return { stdout: `${spec.branch ?? ""}\n`, stderr: "", exitCode: 0 };
		}
		if (joined === "rev-parse --short HEAD") {
			return { stdout: `${spec.commit ?? ""}\n`, stderr: "", exitCode: 0 };
		}
		if (joined === "config user.name") {
			if (spec.userError) throw spec.userError;
			return { stdout: `${spec.user ?? ""}\n`, stderr: "", exitCode: 0 };
		}
		return { stdout: "", stderr: "", exitCode: 0 };
	});
}
