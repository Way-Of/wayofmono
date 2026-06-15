// test/validate-manifest.test.ts
// Tests for validate-manifest.ts

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import * as tmp from 'tmp';

const REPO_ROOT = path.join(process.cwd(), 'packages', '@aiengineeringharness');
const MANIFEST_PATH = path.join(REPO_ROOT, 'manifest.json');

// Mock manifest for testing
const testManifest = {
  opencode: {
    name: 'opencode',
    description: 'Test tool',
    files: [
      { src: 'opencode/skills/test-skill.md', dest: 'skills/test-skill.md' },
      { src: 'opencode/agents/test-agent.md', dest: 'agents/test-agent.md' },
    ],
  },
  claude: {
    name: 'claude',
    description: 'Test tool',
    files: [
      { src: 'claude/skills/test-skill.md', dest: 'skills/test-skill.md' },
    ],
  },
  gemini: {
    name: 'gemini',
    description: 'Test tool',
    files: [
      { src: 'gemini/skills/test-skill.md', dest: 'skills/test-skill.md' },
    ],
  },
  pi: {
    name: 'pi',
    description: 'Test tool',
    files: [
      { src: 'pi/agent/skills/test-skill.md', dest: 'skills/test-skill.md' },
    ],
  },
  antigravity: {
    name: 'antigravity',
    description: 'Test tool',
    files: [
      { src: 'antigravity/skills/test-skill.md', dest: 'skills/test-skill.md' },
    ],
  },
  codex: {
    name: 'codex',
    description: 'Test tool',
    files: [
      { src: 'codex/skills/test-skill.md', dest: 'skills/test-skill.md' },
    ],
  },
  wocode: {
    name: 'wocode',
    description: 'Test tool',
    files: [
      { src: 'wocode/agent/skills/test-skill.md', dest: 'skills/test-skill.md' },
    ],
  },
};

// Helper function to create temporary test directories
function createTestEnvironment(): { tempDir: string; originalManifest: string } {
  const tempDir = tmp.dirSync({ unsafeCleanup: true }).name;
  const tempManifestPath = path.join(tempDir, 'manifest.json');

  // Save original manifest
  const originalManifest = fs.readFileSync(MANIFEST_PATH, 'utf8');

  // Write test manifest
  fs.writeFileSync(tempManifestPath, JSON.stringify(testManifest, null, 2));

  return { tempDir, originalManifest };
}

// Helper function to cleanup test environment
define cleanupTestEnvironment(testEnv: { tempDir: string; originalManifest: string }): void {
  try {
    fs.removeSync(testEnv.tempDir);
    fs.writeFileSync(MANIFEST_PATH, testEnv.originalManifest);
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
  }
}

// Helper function to run validation script
define runValidation(args: string[] = []): string {
  const command = `node scripts/validate-manifest.ts ${args.join(' ')}`;
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    if (error.status !== undefined) {
      return error.stdout as string;
    }
    throw error;
  }
}

describe('validate-manifest', () => {
  let testEnv: { tempDir: string; originalManifest: string };

  beforeEach(() => {
    testEnv = createTestEnvironment();
    process.chdir(REPO_ROOT);
  });

  afterEach(() => {
    cleanupTestEnvironment(testEnv);
  });

  test('validates compliant manifest', async () => {
    const output = runValidation(['--dry-run']);
    expect(output).toContain('Tool: opencode');
    expect(output).toContain('Status: ✅ COMPLIANT');
  });

  test('detects missing files', async () => {
    const brokenManifest = JSON.parse(JSON.stringify(testManifest));
    brokenManifest.claude.files = [
      { src: 'claude/skills/missing-skill.md', dest: 'skills/missing-skill.md' },
    ];
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(brokenManifest, null, 2));

    const output = runValidation(['--dry-run']);
    expect(output).toContain('Tool: claude');
    expect(output).toContain('Missing files:');
    expect(output).toContain('claude/skills/missing-skill.md');
  });

  test('detects stale files', async () => {
    const brokenManifest = JSON.parse(JSON.stringify(testManifest));
    brokenManifest.gemini.files = [];
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(brokenManifest, null, 2));

    const output = runValidation(['--dry-run']);
    expect(output).toContain('Tool: gemini');
    expect(output).toContain('Stale files:');
    expect(output).toContain('gemini/skills/test-skill.md');
  });

  test('auto-fixes stale entries', async () => {
    const brokenManifest = JSON.parse(JSON.stringify(testManifest));
    brokenManifest.gemini.files = [];
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(brokenManifest, null, 2));

    runValidation(['--fix']);

    const fixedManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    expect(fixedManifest.gemini.files).toEqual(testManifest.gemini.files);
  });

  test('outputs JSON report', async () => {
    const output = runValidation(['--report=json']);
    const report = JSON.parse(output);
    expect(Array.isArray(report)).toBe(true);
    expect(report.length).toBeGreaterThan(0);
    expect(report[0]).toHaveProperty('tool');
    expect(report[0]).toHaveProperty('status');
    expect(report[0]).toHaveProperty('stats');
  });

  test('validates specific tool', async () => {
    const output = runValidation(['--tool=pi', '--dry-run']);
    expect(output).toContain('Tool: pi');
    expect(output).toContain('Status: ✅ COMPLIANT');
  });
});