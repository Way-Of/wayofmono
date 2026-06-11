@echo off
REM Ticket Manager Sync - Windows batch wrapper
REM Usage: sync.bat --list
set SCRIPT_DIR=%~dp0
set HARNESS_DIR=%SCRIPT_DIR%..\..
cd /d "%HARNESS_DIR%"
deno run --allow-read --allow-write --allow-run --allow-env "%SCRIPT_DIR%sync.ts" %*
