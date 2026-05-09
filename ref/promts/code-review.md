[---
description: Analyze codebase for unused imports, functions, and files using grep and find
---
Perform a comprehensive code review of $1 (directory or file) focusing on:

# 1. Unused Code Detection
## Check for unused imports
```bash
echo "=== Checking for unused imports ==="
$1
```

## Check for unused functions
```bash
echo "=== Checking for unused functions ==="
grep -rn "^[^/]*function \|^[^/]*const \|^[^/]*let " $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -50
```

## Check for dead code
```bash
echo "=== Checking for commented-out code ==="
grep -rn "^//.*function\|^//.*const\|^//.*let\|^/\*" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -30
```

# 2. File Analysis - Empty or Small Files
```bash
echo "=== Finding empty or small files ==="
find $1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.json" \) -size -10c 2>/dev/null
find $1 -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.json" -size +500c 2>/dev/null
```

# 3. Import Analysis
```bash
echo "=== Analyzing imports ==="
grep -rh "^import\|^from '.*'\|^from \\"" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | cut -d'"' -f2 | cut -d"'" -f2 | sort -u
echo "=== Finding circular dependencies ==="
```

# 4. Code Quality Issues
```bash
echo "=== Checking for TODO/FIXME comments ==="
grep -rn "TODO\|FIXME\|XXX\|@deprecated" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -20
```

# 5. Unused Dependencies
```bash
echo "=== Package.json vs actual usage ==="
if [ -f "$1/package.json" ]; then
  grep -A 50 '"dependencies"' $1/package.json | grep '"' || true
fi
```

# 6. Duplicate Code Patterns
```bash
echo "=== Looking for similar function signatures ==="
grep -rn "function \|const \|let \|export " $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | awk '{print $1":"$2}' | head -40
```
](description: Perform a comprehensive, deep-dive static analysis of the codebase using native bash tools (grep, find, awk) to identify tech debt, unused code, security risks, code quality bypasses, and hardcoded paths.

Perform a comprehensive code review of $1 (directory or file) by executing the following bash commands. Analyze the outputs of each command and provide a summarized code quality report to the user.

1. Codebase Statistics & Bloat

echo "=== Top 15 Largest Files by Line Count ==="
find $1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec wc -l {} + 2>/dev/null | sort -nr | head -16

echo "=== Total File Count by Extension ==="
find $1 -type f | sed -n 's/..*\.//p' | sort | uniq -c | sort -nr | head -10


2. Security & Credentials Scanning

echo "=== Checking for Hardcoded Secrets, Tokens, and Passwords ==="
grep -irnE "api[_-]key|password|secret|token|bearer|auth_token" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.json" --include="*.env*" 2>/dev/null | head -30


3. Debugging & Testing Leftovers

echo "=== Checking for console.logs, debuggers, and alerts ==="
grep -rnE "console\.log|console\.dir|debugger;|alert\(" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -40


4. Code Quality & Rule Bypasses

echo "=== Checking for TypeScript/ESLint Bypasses ==="
grep -rnE "@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable" $1 --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -30

echo "=== Checking for TODO/FIXME/XXX comments ==="
grep -rnE "TODO|FIXME|XXX|@deprecated|HACK" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -30


5. Unused & Dead Code Detection

Check for function/variable declarations

echo "=== Spot-checking function and variable declarations ==="
grep -rnE "^[^/]*function |^[^/]*const |^[^/]*let " $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -50


Check for dead/commented-out code

echo "=== Checking for large commented-out code blocks ==="
grep -rnE "^[[:space:]]*//.*function|^[[:space:]]*//.*const|^[[:space:]]*//.*let|^[[:space:]]*/\*" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -40


6. File Analysis (Empty or Massive Files)

echo "=== Finding empty or suspiciously small files (< 10 bytes) ==="
find $1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.json" \) -size -10c 2>/dev/null

echo "=== Finding massive files (> 500KB) ==="
find $1 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.json" \) -size +500k 2>/dev/null


7. Import & Dependency Analysis

echo "=== Listing all unique import sources ==="
grep -rhE "^import|^from '.*'|^from \\"" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | cut -d'"' -f2 | cut -d"'" -f2 | sort -u | head -50

echo "=== Finding circular dependencies ==="
echo "(Note: Bash cannot detect circular dependencies reliably. Recommend running 'npx madge --circular $1' instead.)"


8. Unused Dependencies (Naïve Heuristic Check)

echo "=== Package.json vs actual usage (Naïve Bash Check) ==="
if [ -f "$1/package.json" ]; then
  echo "Scanning for potentially unused dependencies..."
  grep -E '"[a-zA-Z0-9_-]+":' "$1/package.json" | awk -F'"' '{print $2}' | while read dep; do
    # Skip common config/dev dependencies that might not be imported directly
    if [[ "$dep" == "scripts" || "$dep" == "devDependencies" || "$dep" == "dependencies" || "$dep" == "name" || "$dep" == "version" ]]; then continue; fi

    if ! grep -qR -E "from '$dep'|from \"$dep\"|require\('$dep'\)|require\(\"$dep\"\)" "$1" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null; then
      echo "  [?] No obvious import found for dependency: $dep"
    fi
  done
else
  echo "No package.json found in $1"
fi


9. Duplicate Code Patterns

echo "=== Looking for similar function signatures (Potential duplicates) ==="
grep -rnE "function |const |let |export " $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | awk '{print $1":"$2}' | sort | uniq -d | head -40


10. Portability & Hardcoded Paths

echo "=== Checking for Hardcoded Absolute File Paths ==="
echo "(Finding machine-specific paths like /Users/, /home/, C:\, etc. that break portability)"
grep -rnE "(['\"])(/Users/|/home/|/var/|/opt/|[a-zA-Z]:\\\\)" $1 --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" --include="*.json" --include="*.env*" 2>/dev/null | head -30
)
