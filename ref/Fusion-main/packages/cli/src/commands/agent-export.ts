/**
 * CLI command for exporting agents to Agent Companies packages.
 *
 * Usage:
 *   fn agent export <dir> [--company-name <name>] [--company-slug <slug>] [--project <name>]
 *
 * @module agent-export
 */

import { resolve } from "node:path";

import { AgentStore, exportAgentsToDirectory } from "@fusion/core";

import { resolveProject } from "../project-context.js";

/**
 * Get the project path for agent operations.
 * Falls back to process.cwd() if no project is specified.
 */
async function getProjectPath(projectName?: string): Promise<string> {
  if (projectName) {
    const context = await resolveProject(projectName);
    return context.projectPath;
  }

  try {
    const context = await resolveProject(undefined);
    return context.projectPath;
  } catch {
    return process.cwd();
  }
}

function printSummary(result: {
  outputDir: string;
  agentsExported: number;
  skillsExported: number;
  filesWritten: string[];
  errors: Array<{ agentId: string; error: string }>;
}): void {
  console.log();
  console.log(`  Output directory: ${result.outputDir}`);
  console.log(`  Agents exported: ${result.agentsExported}`);
  console.log(`  Skills exported: ${result.skillsExported}`);
  console.log(`  Files written: ${result.filesWritten.length}`);

  if (result.errors.length > 0) {
    console.log(`  Errors: ${result.errors.length}`);
    for (const err of result.errors) {
      console.log(`    ✗ ${err.agentId}: ${err.error}`);
    }
  }

  console.log();
}

/**
 * Run the agent export command.
 */
export async function runAgentExport(
  outputDir: string,
  options?: {
    project?: string;
    companyName?: string;
    companySlug?: string;
    agentIds?: string[];
  },
): Promise<void> {
  const projectPath = await getProjectPath(options?.project);
  const agentStore = new AgentStore({ rootDir: projectPath + "/.fusion" });
  await agentStore.init();

  const allAgents = await agentStore.listAgents();
  const filterIds = options?.agentIds?.filter((id) => id.trim().length > 0);
  const agents = filterIds && filterIds.length > 0
    ? allAgents.filter((agent) => filterIds.includes(agent.id))
    : allAgents;

  if (agents.length === 0) {
    console.error("No agents found to export");
    process.exit(1);
  }

  const result = await exportAgentsToDirectory(agents, resolve(outputDir), {
    companyName: options?.companyName,
    companySlug: options?.companySlug,
  });

  printSummary(result);
}
