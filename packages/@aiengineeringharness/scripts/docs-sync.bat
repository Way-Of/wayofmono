@echo off
REM Documentation Sync - Windows Batch wrapper
REM Usage: docs-sync.bat [--once|--watch|--status] [--source=pi,gemini,opencode,claude,codex,antigravity]

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%\..\.."

cd /d "%PROJECT_ROOT%"

echo 🔄 Running documentation sync...
deno run --allow-read --allow-write --allow-net --allow-run --allow-env "%SCRIPT_DIR%\docs-sync.ts" %*

echo ✅ Documentation sync complete