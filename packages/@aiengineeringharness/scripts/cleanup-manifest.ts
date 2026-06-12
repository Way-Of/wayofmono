// Remove manifest entries where source file doesn't exist
const manifestPath = "/home/zerwiz/wayofmono/packages/@aiengineeringharness/manifest.json";
const harnessRoot = "/home/zerwiz/wayofmono/packages/@aiengineeringharness";
const manifest = JSON.parse(Deno.readTextFileSync(manifestPath));

let removed = 0;
let kept = 0;

for (const [toolName, toolConfig] of Object.entries(manifest.tools)) {
  const components = (toolConfig as any).components as Record<string, any>;
  const toDelete: string[] = [];

  for (const [compKey, comp] of Object.entries(components)) {
    for (const file of comp.files) {
      const srcPath = `${harnessRoot}/${file.src}`;
      try {
        Deno.statSync(srcPath);
        kept++;
      } catch {
        console.log(`  ${toolName}/${compKey}: source missing (${file.src}) — removing`);
        toDelete.push(compKey);
        break;
      }
    }
  }

  for (const key of toDelete) {
    delete components[key];
    removed++;
  }
}

Deno.writeTextFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nDone. Removed ${removed} stale entries, kept ${kept} valid.`);
