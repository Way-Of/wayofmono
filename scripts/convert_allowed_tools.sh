#!/bin/bash
set -e

# Convert all Pi skill allowed-tools from YAML array to space-delimited format
PI_SKILLS_DIR="/home/zerwiz/CodeP/aiharness/pi/agent/skills"

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
    
    # Use awk to properly convert
    awk '
    BEGIN { in_allowed=0; tools="" }
    /^allowed-tools:/ {
      in_allowed=1
      print "allowed-tools:"
      next
    }
    in_allowed && /^  - / {
      tool = substr($0, 5)
      gsub(/^[ \t]+|[ \t]+$/, "", tool)
      gsub(/^'"'"'|'"'"'$/, "", tool)
      if (tools == "") tools = tool
      else tools = tools " " tool
      next
    }
    in_allowed && !/^  - / {
      # End of allowed-tools section
      print "allowed-tools: " tools
      in_allowed=0
      print
      next
    }
    { print }
    END {
      if (in_allowed && tools != "") {
        print "allowed-tools: " tools
      }
    }
    ' "$skill_file" > "${skill_file}.tmp" && mv "${skill_file}.tmp" "$skill_file"
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