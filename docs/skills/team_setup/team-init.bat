@echo off
REM Team Setup - Windows batch wrapper
REM Usage: team-init.bat init|list|add|assign
set SCRIPT_DIR=%~dp0
set HARNESS_DIR=%SCRIPT_DIR%..\..
cd /d "%HARNESS_DIR%"
deno run --allow-read --allow-write --allow-run --allow-env "%SCRIPT_DIR%team-init.ts" %*
