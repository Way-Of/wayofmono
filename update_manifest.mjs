import fs from 'fs';

const manifestPath = '/home/zerwiz/CodeP/aiharness/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Get the investor_ready_doc_gen skill from opencode (already has all assets)
const opencodeInvestorSkill = manifest.tools.opencode.components["skill/investor_ready_doc_gen"];

if (!opencodeInvestorSkill) {
  console.error('investor_ready_doc_gen not found in opencode');
  process.exit(1);
}

// Tools to add the skill to
const tools = ['claude', 'gemini', 'pi', 'wocoder', 'codex', 'antigravity'];

for (const tool of tools) {
  if (!manifest.tools[tool]) {
    console.log(`Tool ${tool} not found in manifest`);
    continue;
  }

  // Create a copy of the skill with updated src paths
  const skillCopy = {
    description: opencodeInvestorSkill.description,
    files: opencodeInvestorSkill.files.map(f => ({
      ...f,
      src: f.src.replace('opencode/skills/', `${tool}/skills/`)
                  .replace('skills/investor_ready_doc_gen/', `${tool}/skills/investor_ready_doc_gen/`)
    }))
  };

  // Add to the tool's components
  manifest.tools[tool].components["skill/investor_ready_doc_gen"] = skillCopy;
  console.log(`Added investor_ready_doc_gen to ${tool}`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Manifest updated successfully');