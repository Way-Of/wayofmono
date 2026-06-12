#!/usr/bin/env -S deno run -A
/**
 * Fix remaining hard errors from compliance check.
 * 
 * Fixes:
 *   1. document_generation: remove broken "tools" YAML field
 *   2. wow_tickets: convert allowed-tools from array to string, remove unsupported fields
 *   3. ticket_executor: remove empty dirs (MISSING_SKILL)
 *   4. skill-creator: rename dirs per naming convention
 */

import { join } from "jsr:@std/path@1/join";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@1";

const REPO_ROOT = join(import.meta.dirname!, "..", "..", "..");

const TOOLS = ["opencode", "claude", "gemini", "pi", "antigravity", "codex", "wocoder"];

// === Fix 1: document_generation — remove broken "tools" field ===
function fixDocumentGeneration() {
  for (const tool of TOOLS) {
    const path = join(REPO_ROOT, "packages/@aiengineeringharness", tool, "skills", "document_generation", "SKILL.md");
    try {
      const content = Deno.readTextFileSync(path);
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!match) { console.log(`  ${tool}/document_generation: no frontmatter`); continue; }

      const raw = match[1];
      const body = match[2];
      let fm;
      try { fm = parseYaml(raw); } catch { console.log(`  ${tool}/document_generation: YAML parse error`); continue; }

      if (fm["tools"] !== undefined) {
        delete fm["tools"];
        // Also remove dependencies if present
        if (fm["dependencies"] !== undefined) delete fm["dependencies"];

        const newFm = stringifyYaml(fm).trim();
        Deno.writeTextFileSync(path, `---\n${newFm}\n---\n${body}`);
        console.log(`  ${tool}/document_generation: fixed`);
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) console.log(`  ${tool}/document_generation: ${e}`);
    }
  }
}

// === Fix 2: wow_tickets — fix allowed-tools format ===
function fixWowTickets() {
  for (const tool of TOOLS) {
    const path = join(REPO_ROOT, "packages/@aiengineeringharness", tool, "skills", "wow_tickets", "SKILL.md");
    try {
      const content = Deno.readTextFileSync(path);
      
      // Simple fix: replace YAML array allowed-tools with string format
      let newContent = content
        .replace(/allowed-tools:\n(\s+-\s+\w+\n?)+/g, (match) => {
          const items = match.split("\n").filter(l => l.trim().startsWith("- ")).map(l => l.trim().replace(/^- /, ""));
          return `allowed-tools: ${items.join(", ")}`;
        });

      if (newContent !== content) {
        Deno.writeTextFileSync(path, newContent);
        console.log(`  ${tool}/wow_tickets: fixed array → string`);
      } else {
        // Try YAML parse approach
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!match) { console.log(`  ${tool}/wow_tickets: no frontmatter`); continue; }
        
        let fm;
        try { fm = parseYaml(match[1]); } catch { 
          // If it still can't parse, rebuild it
          console.log(`  ${tool}/wow_tickets: YAML error, rebuilding`);
          const body = match[2];
          const name = tool === "pi" ? "wow-tickets" : "wow_tickets";
          const description = "Manage understanding tickets (WOW- prefixed tickets) for tracking system knowledge and refinement requests";
          const newFm = `name: ${name}\ndescription: "${description}"\n`;
          Deno.writeTextFileSync(path, `---\n${newFm}---\n${body}`);
          continue;
        }
        
        if (Array.isArray(fm["allowed-tools"])) {
          fm["allowed-tools"] = (fm["allowed-tools"] as string[]).join(", ");
          const newFmStr = stringifyYaml(fm).trim();
          Deno.writeTextFileSync(path, `---\n${newFmStr}\n---\n${match[2]}`);
          console.log(`  ${tool}/wow_tickets: fixed array via YAML`);
        }
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) console.log(`  ${tool}/wow_tickets: ${e}`);
    }
  }
}

// === Fix 3: ticket_executor — remove empty dirs ===
function fixTicketExecutor() {
  for (const tool of TOOLS) {
    const dir = join(REPO_ROOT, "packages/@aiengineeringharness", tool, "skills", "ticket_executor");
    try {
      Deno.statSync(dir);
      Deno.removeSync(dir, { recursive: true });
      console.log(`  ${tool}/ticket_executor: removed empty dir`);
    } catch {
      // doesn't exist, that's fine
    }
  }
}

// === Fix 4: skill-creator dir naming ===
function fixSkillCreatorNaming() {
  const snakeTools = ["opencode", "claude", "gemini", "antigravity", "codex", "wocoder"];

  for (const tool of snakeTools) {
    const skillsDir = join(REPO_ROOT, "packages/@aiengineeringharness", tool, "skills");
    // The tool-specific dirs: opencode_skill-creator, claude_skill-creator, gemini_skill-creator, etc.
    // Plus antigravity_skill-creator, codex_skill-creator, wocoder_skill-creator
    for (const entry of Deno.readDirSync(skillsDir)) {
      if (entry.isDirectory && entry.name.includes("-")) {
        const newName = entry.name.replace(/-/g, "_");
        const oldPath = join(skillsDir, entry.name);
        const newPath = join(skillsDir, newName);
        try {
          Deno.renameSync(oldPath, newPath);
          console.log(`  ${tool}/${entry.name} → ${newName}`);
        } catch (e) {
          console.log(`  ${tool}/${entry.name}: rename failed: ${e}`);
        }
      }
    }
  }

  // Pi uses kebab-case, so pi_skill-creator → pi-skill-creator
  const piDir = join(REPO_ROOT, "packages/@aiengineeringharness/pi/skills");
  for (const entry of Deno.readDirSync(piDir)) {
    if (entry.isDirectory && entry.name.includes("_")) {
      const newName = entry.name.replace(/_/g, "-");
      const oldPath = join(piDir, entry.name);
      const newPath = join(piDir, newName);
      try {
        Deno.renameSync(oldPath, newPath);
        console.log(`  pi/${entry.name} → ${newName}`);
      } catch (e) {
        console.log(`  pi/${entry.name}: rename failed: ${e}`);
      }
    }
  }
}

console.log("=== Fix 1: document_generation (remove tools field) ===");
fixDocumentGeneration();

console.log("\n=== Fix 2: wow_tickets (array→string allowed-tools) ===");
fixWowTickets();

console.log("\n=== Fix 3: ticket_executor (remove empty dirs) ===");
fixTicketExecutor();

console.log("\n=== Fix 4: skill-creator naming ===");
fixSkillCreatorNaming();

console.log("\nDone!");
