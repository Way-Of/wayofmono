import { type ExecutionEnv, type FileInfo } from "../types.js";
export declare class NodeExecutionEnv implements ExecutionEnv {
    cwd: string;
    private shellPath?;
    private shellEnv?;
    constructor(options: {
        cwd: string;
        shellPath?: string;
        shellEnv?: NodeJS.ProcessEnv;
    });
    exec(command: string, options?: {
        cwd?: string;
        env?: Record<string, string>;
        timeout?: number;
        signal?: AbortSignal;
        onStdout?: (chunk: string) => void;
        onStderr?: (chunk: string) => void;
    }): Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
    readTextFile(path: string): Promise<string>;
    readBinaryFile(path: string): Promise<Uint8Array>;
    writeFile(path: string, content: string | Uint8Array): Promise<void>;
    fileInfo(path: string): Promise<FileInfo>;
    listDir(path: string): Promise<FileInfo[]>;
    realPath(path: string): Promise<string>;
    exists(path: string): Promise<boolean>;
    createDir(path: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    remove(path: string, options?: {
        recursive?: boolean;
        force?: boolean;
    }): Promise<void>;
    createTempDir(prefix?: string): Promise<string>;
    createTempFile(options?: {
        prefix?: string;
        suffix?: string;
    }): Promise<string>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=nodejs.d.ts.map