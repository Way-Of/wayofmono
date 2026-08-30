#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const packagesDir = join(process.cwd(), "packages/@wayofmono");
const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const packages = {};
const versionMap = {};

for (const dir of packageDirs) {
  const pkgPath = join(packagesDir, dir, "package.json");
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    packages[dir] = { path: pkgPath, data: pkg };
    versionMap[pkg.name] = pkg.version;
  } catch (e) {
    console.error(`Failed to read ${pkgPath}:`, e.message);
  }
}

console.log("Current versions:");
for (const [name, version] of Object.entries(versionMap).sort()) {
  console.log(`  ${name}: ${version}`);
}

const versions = new Set(Object.values(versionMap));
if (versions.size > 1) {
  console.error("\nNot all packages have the same version!");
  process.exit(1);
}

console.log("\nAll packages at same version (lockstep)");

let totalUpdates = 0;
for (const [dir, pkg] of Object.entries(packages)) {
  let updated = false;

  for (const field of ["dependencies", "devDependencies"]) {
    if (!pkg.data[field]) continue;
    for (const [depName, currentVersion] of Object.entries(pkg.data[field])) {
      if (versionMap[depName]) {
        const newVersion = `workspace:*`;
        if (currentVersion !== newVersion) {
          console.log(`  ${pkg.data.name}: ${depName} ${currentVersion} -> ${newVersion}`);
          pkg.data[field][depName] = newVersion;
          updated = true;
          totalUpdates++;
        }
      }
    }
  }

  if (updated) {
    writeFileSync(pkg.path, JSON.stringify(pkg.data, null, 2) + "\n");
  }
}

if (totalUpdates === 0) {
  console.log("All inter-package deps already in sync.");
} else {
  console.log(`\nUpdated ${totalUpdates} dependency version(s) to workspace:*`);
}
