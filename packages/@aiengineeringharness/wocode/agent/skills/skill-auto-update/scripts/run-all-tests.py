#!/usr/bin/env python3
"""
run-all-tests.py — Orchestrate all manifest & skill validation tests.

Runs in sequence:
  1. test-yamls.py    — Validate all per-tool YAML configs
  2. test-manifest.py — Validate compiled manifest.json
  3. test-skills.py   — Validate all on-disk skill files for correct per-tool format

Usage:
    python3 scripts/run-all-tests.py                      # Run all tests
    python3 scripts/run-all-tests.py --tool=opencode       # Single tool across all test suites
    python3 scripts/run-all-tests.py --json                # JSON output per test
    python3 scripts/run-all-tests.py --verbose             # Verbose output
    python3 scripts/run-all-tests.py --skip-skills         # Skip skill validation (fast mode)

Exit code: 0 if all pass, 1 if any fail
"""

import os
import sys
import json
import subprocess
from datetime import datetime

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
END = "\033[0m"


def run_test(script_name, args, tool=None):
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    if not os.path.exists(script_path):
        return {"script": script_name, "passed": False, "tool": tool, "error": f"Script not found: {script_path}"}

    cmd = [sys.executable, script_path]
    if tool:
        cmd.extend(["--tool", tool])
    if "--json" in args:
        cmd.append("--json")
    if "--verbose" in args:
        cmd.append("--verbose")

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        return {
            "script": script_name,
            "passed": result.returncode == 0,
            "tool": tool,
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }
    except subprocess.TimeoutExpired:
        return {"script": script_name, "passed": False, "tool": tool, "error": "Timed out after 120s"}
    except Exception as e:
        return {"script": script_name, "passed": False, "tool": tool, "error": str(e)}


def main():
    args = sys.argv[1:]
    single_tool = None
    json_output = "--json" in args
    verbose = "--verbose" in args
    skip_skills = "--skip-skills" in args

    for arg in args:
        if arg.startswith("--tool="):
            single_tool = arg.split("=", 1)[1]
            break

    test_suite = ["test-yamls.py", "test-manifest.py"]
    if not skip_skills:
        test_suite.append("test-skills.py")

    print(f"{BOLD}{'=' * 60}{END}")
    print(f"{BOLD}  AI Engineering Harness — Full Test Suite{END}")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if single_tool:
        print(f"  Tool: {single_tool}")
    if skip_skills:
        print(f"  (skills skipped)")
    print(f"{BOLD}{'=' * 60}{END}")

    results = []
    any_failed = False

    for script in test_suite:
        print(f"\n{BOLD}── Running {script} ──{END}")
        result = run_test(script, args, tool=single_tool)
        results.append(result)

        if result.get("stdout"):
            for line in result["stdout"].split("\n"):
                if line.strip():
                    print(f"  {line}")

        if result.get("stderr"):
            for line in result["stderr"].split("\n"):
                if line.strip():
                    print(f"  {YELLOW}{line}{END}")

        if result["passed"]:
            print(f"  {GREEN}✓ {script} PASSED{END}")
        else:
            print(f"  {RED}✗ {script} FAILED{END}")
            if result.get("error"):
                print(f"  {RED}  Error: {result['error']}{END}")
            any_failed = True

    print(f"\n{BOLD}{'=' * 60}{END}")
    passed_count = sum(1 for r in results if r["passed"])
    print(f"  {passed_count}/{len(results)} test suites passed")

    if any_failed:
        print(f"  {RED}OVERALL: FAILED{END}")
        print(f"{BOLD}{'=' * 60}{END}")
        sys.exit(1)
    else:
        print(f"  {GREEN}OVERALL: PASSED{END}")
        print(f"{BOLD}{'=' * 60}{END}")
        sys.exit(0)


if __name__ == "__main__":
    main()
