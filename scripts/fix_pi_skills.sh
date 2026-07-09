#!/bin/bash
set -e

# Pi Skill Frontmatter Fixer Script
# Fixes Pi skill frontmatter formatting issues to match official Pi specification
# allowed-tools should be space-delimited, NOT YAML array

PI_SKILLS_DIR="/home/zerwiz/CodeP/aiharness/pi/agent/skills"

echo "🔧 Pi Skill Frontmatter Fixer Script (Pi Official Spec)"
echo "======================================================"
echo "Pi Skills Directory: $PI_SKILLS_DIR"
echo ""

# Step 1: Check current state
echo "📋 Checking current Pi skill state..."

total=0
valid_kebab=0
invalid=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  if [[ -d "$skill_dir" ]]; then
    total=$((total + 1))
    # Valid kebab-case: lowercase letters, numbers, hyphens only
    if [[ "$skill_name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
      valid_kebab=$((valid_kebab + 1))
    else
      invalid=$((invalid + 1))
    fi
  fi
done

echo "  Total skill directories: $total"
echo "  Valid kebab-case: $valid_kebab"
echo "  Invalid names: $invalid"
echo ""

# Step 2: Fix allowed-tools format (space-delimited per Pi spec)
echo "📝 Fixing SKILL.md frontmatter (allowed-tools → space-delimited)..."
fixed=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  skill_file="${skill_dir}SKILL.md"
  
  if [[ ! -f "$skill_file" ]]; then
    continue
  fi
  
  # Check if allowed-tools exists and is in array format (has "- ")
  if grep -q "allowed-tools:" "$skill_file" && grep -A10 "allowed-tools:" "$skill_file" | grep -q "^- "; then
    echo "  Converting allowed-tools to space-delimited in: $skill_name"
    
    # Use Python to properly convert YAML array to space-delimited
    python3 -c "
import re
with open('$skill_file', 'r') as f:
    content = f.read()

# Find the allowed-tools section
# Pattern: allowed-tools:\n  - tool1\n  - tool2\n  ...
match = re.search(r'(allowed-tools:)\n((?:  - [^\n]+\n)+)', content)
if match:
    # Extract tools
    tools_section = match.group(2)
    tools = re.findall(r'  - ([^\n]+)', tools_section)
    # Join with spaces
    tools_str = ' '.join(tools)
    # Replace
    new_section = 'allowed-tools: ' + tools_str + '\n'
    content = content[:match.start()] + new_section + content[match.end():]
    with open('$skill_file', 'w') as f:
        f.write(content)
    print('  Converted:', '$skill_name', '->', tools_str)
else:
    print('  No array format found or already space-delimited')
"
    fixed=$((fixed + 1))
  fi
  
  # Also fix name field if needed (remove quotes)
  if grep -q '^name: "' "$skill_file" || grep -q "^name: '" "$skill_file"; then
    sed -i 's/^name: ["'"'"']\([^"'"'"']*\)["'"'"']$/name: \1/' "$skill_file"
    echo "  Fixed name field quotes in: $skill_name"
  fi
done

echo "  Fixed: $fixed SKILL.md files"
echo ""

# Step 3: Validate
echo "✅ Validating fixed state..."
total=0
valid_kebab=0
invalid=0
frontmatter_errors=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  if [[ ! -d "$skill_dir" ]]; then
    continue
  fi
  total=$((total + 1))
  
  # Check directory name format
  if [[ "$skill_name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    valid_kebab=$((valid_kebab + 1))
  else
    invalid=$((invalid + 1))
    echo "  ❌ Invalid directory name: $skill_name"
  fi
  
  # Check SKILL.md frontmatter
  skill_file="${skill_dir}SKILL.md"
  if [[ -f "$skill_file" ]]; then
    # Check name field matches directory
    current_name=$(grep "^name: " "$skill_file" | sed 's/^name: //' | tr -d '"' | tr -d "'")
    if [[ "$current_name" != "$skill_name" ]]; then
      echo "  ❌ Name mismatch: $skill_name (dir) != $current_name (file)"
      frontmatter_errors=$((frontmatter_errors + 1))
    fi
    
    # Check allowed-tools is space-delimited (not YAML array)
    if grep -q "allowed-tools:" "$skill_file" && grep -A10 "allowed-tools:" "$skill_file" | grep -q "^- "; then
      echo "  ❌ allowed-tools still YAML array format in: $skill_name"
      frontmatter_errors=$((frontmatter_errors + 1))
    fi
  fi
done

echo "  Total: $total, Valid kebab-case: $valid_kebab, Invalid: $invalid, Frontmatter errors: $frontmatter_errors"

if [[ $invalid -gt 0 ]] || [[ $frontmatter_errors -gt 0 ]]; then
  echo ""
  echo "❌ Some issues remain. Please check above."
  exit 1
else
  echo ""
  echo "✅ All Pi skills fixed successfully per official Pi specification!"
  echo ""
  echo "Key changes:"
  echo "  - allowed-tools: space-delimited (e.g., 'read write bash')"
  echo "  - name field: no quotes, matches directory exactly"
  echo "  - Directory names: valid kebab-case"
  echo ""
  echo "Next steps:"
  echo "  1. Run: ai-harness --update"
  echo "  2. Test Pi skills: /pi skill <skill-name>"
  echo "  3. Verify Pi harness loads all skills correctly"
fi