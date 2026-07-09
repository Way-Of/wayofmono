import fs from 'fs';

const manifestPath = '/home/zerwiz/CodeP/aiharness/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Fix pi skill paths: they should use pi/agent/extensions/skills/ not pi/skills/
if (manifest.tools.pi?.components?."skill/investor_ready_doc_gen") {
  const piSkill = manifest.tools.pi.components["skill/investor_ready_doc_gen"];
  
  // Update all src paths in the skill files
  if (piSkill.files) {
    piSkill.files = piSkill.files.map(file => {
      // Replace pi/skills/investor_ready_doc_gen/ with pi/agent/extensions/skills/investor_ready_doc_gen/
      // But investor_ready_doc_gen needs kebab-case directory name
      let newSrc = file.src.replace('pi/skills/investor_ready_doc_gen/', 'pi/agent/extensions/skills/investor-ready-doc-gen/');
      
      // Also fix the skill component key
      return {
        ...file,
        src: newSrc,
        // Note: The component key remains "skill/investor_ready_doc_gen" 
        // but the actual skill name is kebab-case
      };
    });
  }
  
  console.log('Updated pi investor_ready_doc_gen skill paths for Pi harness');
}

// Also fix the manifest key name to match the actual skill name
manifest.tools.pi.components["skill/investor-ready-doc-gen"] = manifest.tools.pi.components["skill/investor_ready_doc_gen"];
delete manifest.tools.pi.components["skill/investor_ready_doc_gen"];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Manifest updated with correct Pi paths and kebab-case skill name');