/** Error thrown by {@link ExecutionEnv} file operations. */
export class FileError extends Error {
    code;
    path;
    constructor(
    /** Backend-independent error code. */
    code, message, 
    /** Absolute addressed path associated with the failure, when available. */
    path, options) {
        super(message, options);
        this.code = code;
        this.path = path;
        this.name = "FileError";
    }
}
//# sourceMappingURL=types.js.map