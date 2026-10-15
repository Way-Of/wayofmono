@echo off
rem Docs Sync Updater (PROJ-022) — delegates to scripts/docs-sync.ts
set SCRIPT_DIR=%~dp0
set HARNESS_DIR=%SCRIPT_DIR%..\..
deno run --allow-read --allow-write --allow-run --allow-env "%HARNESS_DIR%\scripts\docs-sync.ts" %*
