#!/usr/bin/env npx tsx

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const packagesDir = join(process.cwd(), "packages/@wayofmono");
const dirs = readdirSync(packagesDir, { withFileTypes: true }).filter(d => d.isDirectory());

let totalSource = 0;
let totalTest = 0;
let totalFiles = 0;

console.log("\nPackage stats:");
console.log("-".repeat(72));
console.log(`  ${"Package".padEnd(20)} ${"Files".padEnd(6)} ${"Source".padEnd(10)} ${"Test".padEnd(10)} ${"Size"}`);
console.log("-".repeat(72));

for (const dir of dirs) {
  const srcDir = join(packagesDir, dir.name, "src");
  let sourceLines = 0;
  let testLines = 0;
  let fileCount = 0;

  function countFiles(d: string) {
    if (!statSync(d, { throwIfNoEntry: false })) return;
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const fullPath = join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules") countFiles(fullPath);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        fileCount++;
        const content = readFileSync(fullPath, "utf8");
        const lines = content.split("\n").length;
        if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".spec.ts")) {
          testLines += lines;
        } else {
          sourceLines += lines;
        }
      }
    }
  }

  countFiles(srcDir);
  totalSource += sourceLines;
  totalTest += testLines;
  totalFiles += fileCount;

  const sizeStr = `${(sourceLines + testLines).toLocaleString()} lines`;
  console.log(`  ${dir.name.padEnd(20)} ${String(fileCount).padEnd(6)} ${sourceLines.toLocaleString().padEnd(10)} ${testLines.toLocaleString().padEnd(10)} ${sizeStr}`);
}

console.log("-".repeat(72));
console.log(`  ${"TOTAL".padEnd(20)} ${String(totalFiles).padEnd(6)} ${totalSource.toLocaleString().padEnd(10)} ${totalTest.toLocaleString().padEnd(10)} ${(totalSource + totalTest).toLocaleString()} lines`);
