/**
 * Wom-Integrity-Pipeline Engine
 *
 * The central orchestration loop for WayOfMono code analysis.
 * Wires together LSP, Read-Guard, Structural Scanners, and UI status.
 */

import * as nodeFs from "node:fs";
import { WomLSPDiscoveryService, getWomLSPService } from "../clients/lsp/wom-lsp-service.js";
import { WomReadGuard } from "./wom-read-guard.js";
import { WomTreeSitter } from "../clients/wom-tree-sitter.js";

export interface PipelineResult {
  output: string;
  hasBlockers: boolean;
  isError: boolean;
}

export class WomIntegrityPipeline {
  private lspService: WomLSPDiscoveryService;
  private readGuard: WomReadGuard;
  private treeSitter: WomTreeSitter;

  constructor(readGuard: WomReadGuard, treeSitter: WomTreeSitter) {
    this.lspService = getWomLSPService();
    this.readGuard = readGuard;
    this.treeSitter = treeSitter;
  }

  /**
   * Run the analysis loop on a file modification.
   */
  async run(filePath: string, editStart: number, editEnd: number): Promise<PipelineResult> {
    // 1. Safety First: Read-Guard Check
    const guardVerdict = this.readGuard.checkEdit(filePath, editStart, editEnd);
    if (guardVerdict.action === "block") {
      return {
        output: guardVerdict.reason || "Edit blocked by Read-Guard.",
        hasBlockers: true,
        isError: true
      };
    }

    // 2. Load Content
    let content: string;
    try {
      content = nodeFs.readFileSync(filePath, "utf-8");
    } catch (err) {
      return { output: `Failed to read file: ${filePath}`, hasBlockers: false, isError: true };
    }

    // 3. LSP Synchronization (Asynchronous)
    const langId = this.getLanguageId(filePath);
    void this.lspService.syncFile(filePath, content, langId);

    // 4. Dispatch Parallel Diagnostics
    const diagnostics = await this.lspService.aggregateDiagnostics(filePath);

    // 5. Build Unified Output
    const output = this.formatDiagnostics(diagnostics);
    const hasErrors = diagnostics.some(d => d.severity === "error");

    return {
      output,
      hasBlockers: hasErrors,
      isError: hasErrors
    };
  }

  private getLanguageId(filePath: string): string {
    const ext = filePath.split(".").pop();
    switch (ext) {
      case "ts": return "typescript";
      case "js": return "javascript";
      case "py": return "python";
      case "go": return "go";
      case "rs": return "rust";
      default: return "plaintext";
    }
  }

  private formatDiagnostics(diags: any[]): string {
    if (diags.length === 0) return "✓ clean";
    
    let out = "<wom-diagnostics>\n";
    for (const d of diags) {
      const icon = d.severity === "error" ? "🔴" : "🟡";
      out += `  ${icon} line ${d.line}, col ${d.column}: ${d.message} [${d.tool}]\n`;
    }
    out += "</wom-diagnostics>";
    return out;
  }
}
