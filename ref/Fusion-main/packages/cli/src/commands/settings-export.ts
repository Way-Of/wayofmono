import { writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { TaskStore, exportSettings, generateExportFilename } from "@fusion/core";
import { resolveProject } from "../project-context.js";

/**
 * Run settings export command.
 * Usage: fn settings export [--output <path>] [--scope global|project|both]
 *
 * @param options.output - Custom output file path (optional, auto-generates if not provided)
 * @param options.scope - Which settings to export: 'global', 'project', or 'both' (default: 'both')
 * @param options.projectName - Optional project name for project-scoped export
 */
export async function runSettingsExport(options: {
  output?: string;
  scope?: "global" | "project" | "both";
  projectName?: string;
} = {}): Promise<void> {
  const scope = options.scope ?? "both";
  const project = options.projectName ? await resolveProject(options.projectName) : undefined;

  const store = new TaskStore(project?.projectPath ?? process.cwd());
  await store.init();
  const outputPath = options.output;

  try {
    const exportData = await exportSettings(store, { scope });

    let targetPath: string;
    if (outputPath) {
      targetPath = resolve(outputPath);
    } else {
      const filename = generateExportFilename();
      targetPath = join(process.cwd(), filename);
    }

    const jsonContent = JSON.stringify(exportData, null, 2);
    await writeFile(targetPath, jsonContent);

    console.log();
    console.log(`  ✓ Settings exported to ${targetPath}`);

    const parts: string[] = [];
    if (exportData.global) {
      const globalKeys = Object.keys(exportData.global).filter(
        (k) => exportData.global?.[k as keyof typeof exportData.global] !== undefined
      );
      if (globalKeys.length > 0) {
        parts.push(`${globalKeys.length} global setting(s)`);
      }
    }
    if (exportData.project) {
      const projectKeys = Object.keys(exportData.project).filter(
        (k) => exportData.project?.[k as keyof typeof exportData.project] !== undefined
      );
      if (projectKeys.length > 0) {
        parts.push(`${projectKeys.length} project setting(s)`);
      }
    }

    if (parts.length > 0) {
      console.log(`    Exported: ${parts.join(", ")}`);
    }
    console.log();

    process.exit(0);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
