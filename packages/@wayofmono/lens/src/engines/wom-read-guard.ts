/**
 * Wom-Read-Guard Engine
 *
 * Specialized WayOfMono (Wom) safety mechanism that enforces a "Read-Before-Edit" policy.
 * Prevents agents from hallucinating code changes by ensuring they have read 
 * the target file/range in the current session.
 */

import * as fs from "node:fs";

export interface WomReadRecord {
  filePath: string;
  startLine: number;
  endLine: number;
  timestamp: number;
  isSymbolExpanded: boolean;
}

export interface WomReadGuardVerdict {
  action: "allow" | "block" | "warn";
  reason?: string;
}

export class WomReadGuard {
  private reads = new Map<string, WomReadRecord[]>();
  private exemptions = new Set<string>();

  /**
   * Record a file read event.
   */
  recordRead(record: WomReadRecord): void {
    const fileReads = this.reads.get(record.filePath) ?? [];
    fileReads.push(record);
    this.reads.set(record.filePath, fileReads);
  }

  /**
   * Check if an edit operation is safe to proceed.
   */
  checkEdit(filePath: string, editStart: number, editEnd: number): WomReadGuardVerdict {
    // 1. Check for manual exemptions (/wom-lens-allow)
    if (this.exemptions.has(filePath)) {
      this.exemptions.delete(filePath); // One-time use
      return { action: "allow" };
    }

    // 2. Check for zero-read
    const fileReads = this.reads.get(filePath);
    if (!fileReads || fileReads.length === 0) {
      return {
        action: "block",
        reason: `🔴 BLOCKED: You are trying to edit '${filePath}' but haven't read it yet.`,
      };
    }

    // 3. Check for range coverage
    if (this.isRangeCovered(fileReads, editStart, editEnd)) {
      return { action: "allow" };
    }

    return {
      action: "block",
      reason: `🔴 BLOCKED: Your edit on lines ${editStart}-${editEnd} is outside the ranges you've read for '${filePath}'.`,
    };
  }

  /**
   * Grant a one-time exemption for a file.
   */
  addExemption(filePath: string): void {
    this.exemptions.add(filePath);
  }

  private isRangeCovered(reads: WomReadRecord[], start: number, end: number): boolean {
    // Merge overlapping read ranges
    const ranges = reads
      .map(r => [r.startLine, r.endLine] as [number, number])
      .sort((a, b) => a[0] - b[0]);

    const merged: [number, number][] = [];
    for (const [s, e] of ranges) {
      if (merged.length > 0 && s <= merged[merged.length - 1][1] + 1) {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
      } else {
        merged.push([s, e]);
      }
    }

    // Check if any merged range covers the edit
    return merged.some(([ms, me]) => start >= ms && end <= me);
  }
}
