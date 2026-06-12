// Add build_tool entries to manifest.json for all 7 tools
const manifestPath = "/home/zerwiz/wayofmono/packages/@aiengineeringharness/manifest.json";
const manifest = JSON.parse(Deno.readTextFileSync(manifestPath));

const buildToolSkills: Record<string, { tool: string; dirName: string }> = {
  claude: { tool: "claude", dirName: "build_tool" },
  opencode: { tool: "opencode", dirName: "build_tool" },
  gemini: { tool: "gemini", dirName: "build_tool" },
  pi: { tool: "pi", dirName: "build-tool" },
  antigravity: { tool: "antigravity", dirName: "build_tool" },
  codex: { tool: "codex", dirName: "build_tool" },
  wocoder: { tool: "wocoder", dirName: "build_tool" },
};

for (const [toolName, spec] of Object.entries(buildToolSkills)) {
  const toolConfig = manifest.tools[toolName];
  if (!toolConfig) {
    console.error(`Tool ${toolName} not found in manifest`);
    continue;
  }

  const skillKey = `skill/build_${spec.dirName === "build-tool" ? "tool" : spec.dirName}`;
  const actualDirName = spec.dirName;

  // Check if already present
  if (toolConfig.components[skillKey]) {
    console.log(`  ${toolName}/${actualDirName}: already in manifest ✓`);
    continue;
  }

  // Verify the source files exist
  const srcDir = spec.tool;
  const skillPath = `${srcDir}/skills/${actualDirName}/SKILL.md`;
  const fullPath = `/home/zerwiz/wayofmono/packages/@aiengineeringharness/${skillPath}`;
  try {
    Deno.statSync(fullPath);
  } catch {
    console.error(`  ${toolName}/${actualDirName}: SKILL.md not found at ${fullPath}`);
    continue;
  }

  // Add as last skill entry
  toolConfig.components[skillKey] = {
    description: "Universal component builder for all 7 AI coding tools",
    files: [
      {
        src: skillPath,
        dest: `skills/${actualDirName}/SKILL.md`,
      },
    ],
  };

  console.log(`  ${toolName}/${actualDirName}: added to manifest ✓`);
}

Deno.writeTextFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("\nManifest updated.");
