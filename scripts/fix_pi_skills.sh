#!/bin/bash
set -e

# Pi Skill Frontmatter Fixer Script
# Fixes Pi skill frontmatter formatting issues

PI_SKILLS_DIR="/home/zerwiz/wayofmono/packages/@aiengineeringharness/pi/agent/skills"
DRY_RUN=false

echo "🔧 Pi Skill Frontmatter Fixer Script"
echo "===================================="
echo "Pi Skills Directory: $PI_SKILLS_DIR"
echo ""

# Step 1: Check current state
echo "📋 Checking current Pi skill state..."

total=0
kebab=0
snake=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  if [[ -d "$skill_dir" ]]; then
    total=$((total + 1))
    if [[ "$skill_name" == *-* ]]; then
      kebab=$((kebab + 1))
    else
      snake=$((snake + 1))
    fi
  fi
done

echo "  Total skill directories: $total"
echo "  Kebab-case: $kebab"
echo "  Snake_case: $snake"
echo ""

if [[ $snake -gt 0 ]]; then
  echo "⚠️  Found $snake snake_case directories to fix"
fi

# Step 2: Rename snake_case to kebab-case
echo "🔄 Renaming snake_case to kebab-case..."
renamed=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  if [[ ! -d "$skill_dir" ]]; then
    continue
  fi
  # Only rename if it contains underscores (snake_case)
  if [[ "$skill_name" == *_* ]]; then
    new_name=$(echo "$skill_name" | sed 's/_/\-/g')
    echo "  Renaming: $skill_name → $new_name"
    mv "$skill_dir" "${PI_SKILLS_DIR}/${new_name}"
    renamed=$((renamed + 1))
  fi
done

echo "  Renamed: $renamed directories"
echo ""

# Step 3: Fix SKILL.md frontmatter
echo "📝 Fixing SKILL.md frontmatter..."
fixed=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  skill_file="${skill_dir}SKILL.md"
  
  if [[ ! -f "$skill_file" ]]; then
    continue
  fi
  
  # Fix name field
  current_name=$(grep "^name: " "$skill_file" | sed 's/^name: //' | tr -d '"' | tr -d "'")
  if [[ "$current_name" != "$skill_name" ]]; then
    echo "  Fixing name: $current_name → $skill_name in $skill_name"
    sed -i "s/^name: .*/name: $skill_name/" "$skill_file"
    fixed=$((fixed + 1))
  fi
  
  # Fix allowed-tools: convert comma-separated to YAML array
  if grep -q "allowed-tools:" "$skill_file"; then
    # Check if it's already in array format
    if ! grep -A5 "allowed-tools:" "$skill_file" | grep -q "^- "; then
      echo "  Fixing allowed-tools format in: $skill_name"
      # Use sed to fix the format - more reliable than awk
      # First, replace the line with allowed-tools: and array format
      sed -i '/allowed-tools:/ {
        s/allowed-tools: *\(.*\)$/allowed-tools:/
        s/, */\n  - /g
      }' "$skill_file"
      
      # The above might not work perfectly, let me use a more robust approach
      # Read the file, find allowed-tools line, and rebuild it
      python3 -c "
import re
with open('$skill_file', 'r') as f:
    content = f.read()

# Find allowed-tools line
match = re.search(r'allowed-tools:\s*(.+)', content)
if match and '- ' not in content[match.start():match.end()+200]:
    tools_str = match.group(1).strip()
    # Split by comma
    tools = [t.strip() for t in tools_str.split(',') if t.strip()]
    # Build new allowed-tools section
    new_section = 'allowed-tools:\n'
    for tool in tools:
        new_section += '  - ' + tool + '\n'
    # Replace in content
    content = content[:match.start()] + new_section + content[match.end():]
    with open('$skill_file', 'w') as f:
        f.write(content)
"
      fixed=$((fixed + 1))
    fi
  fi
done

echo "  Fixed: $fixed SKILL.md files"
echo ""

# Step 4: Validate
echo "✅ Validating fixed state..."
total=0
kebab=0
snake=0
errors=0

for skill_dir in "$PI_SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  if [[ ! -d "$skill_dir" ]]; then
    continue
  fi
  total=$((total + 1))
  
  if [[ "$skill_name" != *-* ]]; then
    snake=$((snake + 1))
    echo "  ❌ Directory still snake_case: $skill_name"
    errors=$((errors + 1))
  else
    kebab=$((kebab + 1))
  fi
  
  skill_file="${skill_dir}SKILL.md"
  if [[ -f "$skill_file" ]]; then
    current_name=$(grep "^name: " "$skill_file" | sed 's/^name: //' | tr -d '"' | tr -d "'")
    if [[ "$current_name" != "$skill_name" ]]; then
      echo "  ❌ Name mismatch: $skill_name (dir) != $current_name (file)"
      errors=$((errors + 1))
    fi
    
    # Check allowed-tools format
    if grep -q "allowed-tools:" "$skill_file" && ! grep -A5 "allowed-tools:" "$skill_file" | grep -q "^- "; then
      echo "  ❌ allowed-tools still not array format in: $skill_name"
      errors=$((errors + 1))
    fi
  fi
done

echo "  Total: $total, Kebab-case: $kebab, Snake_case: $snake, Errors: $errors"

if [[ $errors -gt 0 ]]; then
  echo ""
  echo "❌ Some issues remain. Please check above."
  exit 1
else
  echo ""
  echo "✅ All Pi skills fixed successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Run: deno install.ts --update"
  echo "  2. Test Pi skills: /pi skill <skill-name>"
  echo "  3. Verify Pi harness loads all skills correctly"
fi