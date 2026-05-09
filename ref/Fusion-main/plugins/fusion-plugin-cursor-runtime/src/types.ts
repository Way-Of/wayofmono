export interface CursorBinaryStatus {
  available: boolean;
  authenticated?: boolean;
  binaryPath?: string;
  binaryName?: string;
  version?: string;
  reason?: string;
  probeDurationMs: number;
}
