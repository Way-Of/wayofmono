#!/bin/bash
set -e

# Convert all Pi skill allowed-tools from YAML array to space-delimited format
PI_SKILLS_DIR="/home/zerwiz/wayofmono/packages/@aiengineeringharness/pi/agent/skills"

echo "🔄 Converting allowed-tools to space-delimited format for all Pi skills..."

for skill_file in "$PI_SKILLS_DIR"/*/SKILL.md; do
  skill_dir=$(dirname "$skill_file")
  skill_name=$(basename "$skill_dir")
  
  if [[ ! -f "$skill_file" ]]; then
    continue
  fi
  
  # Check if allowed-tools exists in YAML array format
  if grep -q "allowed-tools:" "$skill_file" && grep -A10 "allowed-tools:" "$skill_file" | grep -q "^- "; then
    echo "  Converting: $skill_name"
    
    # Use Python for reliable YAML array to space-delimited conversion
    python3 -c "
import re
with open('$skill_file', 'r') as f:
    content = f.read()

# Find allowed-tools section with array format
# Pattern: allowed-tools:\n  - tool1\n  - tool2\n...
match = re.search(r'(allowed-tools:\n)((?:  - [^\n]+\n)+)', content)
if match:
    # Extract tools
    tools_section = match.group(2)
    tools = re.findall(r'  - ([^\n]+)', tools_section)
    # Clean up tools
    tools = [t.strip().strip('\"').strip(\"'\") for t in tools if t.strip()]
    # Join with spaces
    tools_str = ' '.join(tools)
    # Replace
    new_section = 'allowed-tools: ' + tools_str + '\n'
    content = content[:match.start()] + new_section + content[match.end():]
    with open('$skill_file', 'w') as f:
        f.write(content)
    print('  Converted:', '$skill_name', '->', tools_str)
else:
    print('  No array format found:', '$skill_name')
"
  fi
done

echo "✅ Conversion complete"

# Verify
echo ""
echo "📋 Verification:"
for skill_file in "$PI_SKILLS_DIR"/*/SKILL.md; do
  skill_dir=$(dirname "$skill_file")
  skill_name=$(basename "$skill_dir")
  
  if grep -q "allowed-tools:" "$skill_file" && grep -A5 "allowed-tools:" "$skill_file" | grep -q "^- "; then
    echo "  ❌ Still YAML array: $skill_name"
  elif grep -q "allowed-tools:" "$skill_file"; then
    allowed=$(grep "^allowed-tools:" "$skill_file" | sed 's/allowed-tools: //')
    echo "  ✅ Space-delimited: $skill_name -> $allowed"
  fi
done