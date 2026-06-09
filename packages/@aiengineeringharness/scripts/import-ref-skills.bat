@echo off
REM Import Ref Skills/Agents - Windows batch wrapper
REM Usage: import-ref-skills.bat [--gap-analysis|--skill=tdd|--agents]
set SCRIPT_DIR=%~dp0
set HARNESS_DIR=%SCRIPT_DIR%..
cd /d "%HARNESS_DIR%"
deno run --allow-read --allow-write --allow-run --allow-env "%SCRIPT_DIR%import-ref-skills.ts" %*
