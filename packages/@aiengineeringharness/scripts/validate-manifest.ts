// validate-manifest.ts
// Manifest validation script for AI Engineering Harness

import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'fast-glob';
import { program } from 'yargs';

// Configuration
const REPO_ROOT = path.join(process.cwd(), 'packages', '@aiengineeringharness');
const MANIFEST_PATH = path.join(REPO_ROOT, 'manifest.json');

// Tool-specific path patterns
type ToolPathPatterns = {
  [key: string]: string;
};

const toolPaths: ToolPathPatterns = {
  opencode: 'packages/@aiengineeringharness/opencode',
  claude: 'packages/@aiengineeringharness/claude',
  gemini: 'packages/@aiengineeringharness/gemini',
  pi: 'packages/@aiengineeringharness/pi/agent',
  antigravity: 'packages/@aiengineeringharness/antigravity',
  codex: 'packages/@aiengineeringharness/codex',
  wocode: 'packages/@aiengineeringharness/wocode/agent',
};

interface ValidationIssue {
  file: string;
  type: 'missing' | 'stale' | 'format';
  severity: 'low' | 'medium' | 'high';
  message: string;
  tool: string;
}

interface ValidationResult {
  tool: string;
  status: 'compliant' | 'warning' | 'error';
  missingFiles: string[];
  staleFiles: string[];
  formatIssues: ValidationIssue[];
  stats: {
    total: number;
    ok: number;
    missing: number;
    stale: number;
    format: number;
  };
}

interface ManifestFile {
  src: string;
  dest: string;
}

interface ManifestTool {
  name: string;
  description: string;
  files: ManifestFile[];
}

interface Manifest {
  [key: string]: ManifestTool;
}

async function loadManifest(): Promise<Manifest> {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf8');
    return JSON.parse(content) as Manifest;
  } catch (error) {
    console.error('Error loading manifest.json:', error);
    process.exit(3);
  }
}

async function getAllFiles(toolName: string): Promise<string[]> {
  const toolRoot = path.join(REPO_ROOT, toolPaths[toolName]);

  try {
    if (!fs.existsSync(toolRoot)) {
      return [];
    }

    const patterns = [
      '**/*.md',
      '**/*.ts',
      '**/*.json',
      '**/*.yaml',
      '**/*.yml',
      '**/*.css',
      '**/*.js',
    ];

    const files = await Promise.all(
      patterns.map(async (pattern) => {
        try {
          return await glob.glob(path.join(toolRoot, pattern), {
            onlyFiles: true,
            dot: false,
          });
        } catch (error) {
          return [];
        }
      })
    );

    return files.flat().map((file) => path.relative(REPO_ROOT, file));
  } catch (error) {
    console.error(`Error scanning files for tool ${toolName}:`, error);
    return [];
  }
}

function validatePathFormat(filePath: string): ValidationIssue | null {
  if (!filePath.startsWith('packages/@aiengineeringharness/')) {
    return {
      file: filePath,
      type: 'format',
      severity: 'high',
      message: `File path doesn't start with expected base path: ${filePath}`,
      tool: 'system',
    };
  }

  if (filePath.includes('..') || filePath.includes('//')) {
    return {
      file: filePath,
      type: 'format',
      severity: 'medium',
      message: `File path contains invalid characters: ${filePath}`,
      tool: 'system',
    };
  }

  return null;
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

async function validateTool(
  toolName: string,
  manifest: Manifest,
  dryRun: boolean = false
): Promise<ValidationResult> {
  const toolConfig = manifest[toolName];
  if (!toolConfig) {
    return {
      tool: toolName,
      status: 'error',
      missingFiles: [],
      staleFiles: [],
      formatIssues: [],
      stats: { total: 0, ok: 0, missing: 0, stale: 0, format: 0 },
    };
  }

  const allFilesOnDisk = await getAllFiles(toolName);
  const allFilesOnDiskSet = new Set(allFilesOnDisk);

  const manifestFiles = toolConfig.files || [];
  const manifestFilesSet = new Set(
    manifestFiles.map((f) => normalizePath(f.src))
  );

  const missingFiles: string[] = [];
  const staleFiles: string[] = [];
  const formatIssues: ValidationIssue[] = [];

  for (const manifestFile of manifestFiles) {
    const normalizedSrc = normalizePath(manifestFile.src);

    const formatIssue = validatePathFormat(normalizedSrc);
    if (formatIssue) {
      formatIssues.push(formatIssue);
      continue;
    }

    if (!allFilesOnDiskSet.has(normalizedSrc)) {
      missingFiles.push(normalizedSrc);
    }
  }

  for (const diskFile of allFilesOnDisk) {
    if (!manifestFilesSet.has(diskFile)) {
      staleFiles.push(diskFile);
    }
  }

  const hasIssues = missingFiles.length > 0 || staleFiles.length > 0 || formatIssues.length > 0;
  const status = hasIssues
    ? missingFiles.length > 0
      ? 'error'
      : 'warning'
    : 'compliant';

  const stats = {
    total: manifestFiles.length,
    ok: manifestFiles.length - missingFiles.length - formatIssues.length,
    missing: missingFiles.length,
    stale: staleFiles.length,
    format: formatIssues.length,
  };

  if (!dryRun && staleFiles.length > 0) {
    await removeStaleEntries(toolName, manifest, staleFiles);
  }

  return {
    tool: toolName,
    status,
    missingFiles,
    staleFiles,
    formatIssues,
    stats,
  };
}

async function removeStaleEntries(
  toolName: string,
  manifest: Manifest,
  staleFiles: string[]
): Promise<void> {
  try {
    const toolConfig = manifest[toolName];
    if (!toolConfig) return;

    const manifestFiles = toolConfig.files || [];
    const staleSet = new Set(staleFiles.map(normalizePath));

    const updatedFiles = manifestFiles.filter((f) => {
      const normalizedSrc = normalizePath(f.src);
      if (staleSet.has(normalizedSrc)) {
        console.log(`[INFO] Removing stale entry: ${normalizedSrc}`);
        return false;
      }
      return true;
    });

    toolConfig.files = updatedFiles;

    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`[INFO] Updated manifest.json for tool: ${toolName}`);
  } catch (error) {
    console.error(`Error removing stale entries for tool ${toolName}:`, error);
  }
}

async function validateManifest(
  options: {
    dryRun?: boolean;
    fix?: boolean;
    tool?: string;
    reportFormat?: 'text' | 'json' | 'csv';
  } = {}
): Promise<ValidationResult[]> {
  const manifest = await loadManifest();
  const tools = options.tool ? [options.tool] : Object.keys(manifest);

  const results: ValidationResult[] = [];

  for (const toolName of tools) {
    const result = await validateTool(toolName, manifest, options.dryRun || false);
    results.push(result);

    if (!options.dryRun && options.fix && result.staleFiles.length > 0) {
      await removeStaleEntries(toolName, manifest, result.staleFiles);
    }
  }

  const overallStatus = results.some((r) => r.status === 'error')
    ? 'error'
    : results.some((r) => r.status === 'warning')
    ? 'warning'
    : 'compliant';

  printReport(results, options.reportFormat || 'text', overallStatus);

  process.exit(overallStatus === 'compliant' ? 0 : overallStatus === 'warning' ? 1 : 2);
}

function printReport(
  results: ValidationResult[],
  format: 'text' | 'json' | 'csv',
  overallStatus: string
): void {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(results, null, 2));
      break;
    case 'csv':
      printCSVReport(results);
      break;
    default:
      printTextReport(results, overallStatus);
      break;
  }
}

function printTextReport(results: ValidationResult[], overallStatus: string): void {
  console.log('\n=== Manifest Validation Report ===\n');

  let totalMissing = 0;
  let totalStale = 0;
  let totalFormat = 0;

  for (const result of results) {
    console.log(`Tool: ${result.tool}`);
    console.log(`Status: ${getStatusEmoji(result.status)} ${result.status.toUpperCase()}\n`);

    if (result.missingFiles.length > 0) {
      console.log('Missing files:');
      for (const file of result.missingFiles) {
        console.log(`  ❌ ${file}`);
      }
      console.log();
      totalMissing += result.missingFiles.length;
    }

    if (result.staleFiles.length > 0) {
      console.log('Stale files:');
      for (const file of result.staleFiles) {
        console.log(`  ⚠️  ${file}`);
      }
      console.log();
      totalStale += result.staleFiles.length;
    }

    if (result.formatIssues.length > 0) {
      console.log('Format issues:');
      for (const issue of result.formatIssues) {
        console.log(`  ❌ ${issue.message}`);
      }
      console.log();
      totalFormat += result.formatIssues.length;
    }

    console.log(`Summary:
  - Total entries checked: ${result.stats.total}
  - Missing files: ${result.stats.missing} (${result.stats.missing > 0 ? Math.round((result.stats.missing / result.stats.total) * 100) : 0}%)
  - Stale files: ${result.stats.stale} (${result.stats.stale > 0 ? Math.round((result.stats.stale / result.stats.total) * 100) : 0}%)
  - Format issues: ${result.stats.format} (${result.stats.format > 0 ? Math.round((result.stats.format / result.stats.total) * 100) : 0}%)
  - Issues resolved: ${result.stats.total - (result.stats.missing + result.stats.stale + result.stats.format)}

\n');
  }

  console.log('=== Overall Status: ' + getStatusEmoji(overallStatus) + ' ' + overallStatus.toUpperCase() + ' ===\n');

  if (totalMissing > 0 || totalStale > 0 || totalFormat > 0) {
    console.log('Actions:');
    console.log('  - Use --fix to auto-remove stale entries');
    console.log('  - Check missing files manually');
    console.log('  - Fix format issues');
    console.log();
  }
}

function printCSVReport(results: ValidationResult[]): void {
  console.log('tool,status,total,ok,missing,stale,format');

  for (const result of results) {
    console.log(
      `${result.tool},${result.status},${result.stats.total},${result.stats.ok},${result.stats.missing},${result.stats.stale},${result.stats.format}`
    );
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'compliant':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return '❓';
  }
}

async function main(): Promise<void> {
  program
    .usage('Usage: $0 [options]')
    .option('dry-run', {
      describe: 'Show what would be fixed without making changes',
      type: 'boolean',
      default: false,
    })
    .option('fix', {
      describe: 'Auto-fix: Remove invalid entries',
      type: 'boolean',
      default: false,
    })
    .option('tool', {
      describe: 'Validate specific tool only',
      type: 'string',
    })
    .option('report', {
      describe: 'Output report format: text|json|csv',
      type: 'string',
      default: 'text',
      choices: ['text', 'json', 'csv'],
    })
    .help('help');

  const argv = await program.parse();

  await validateManifest({
    dryRun: argv.dryRun,
    fix: argv.fix,
    tool: argv.tool,
    reportFormat: argv.report as 'text' | 'json' | 'csv',
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(3);
});