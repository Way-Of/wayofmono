@echo off
REM Ticket Migration Script - Windows Batch wrapper
REM Usage: migrate-tickets.bat

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%\..\.."

cd /d "%PROJECT_ROOT%"

echo 🔄 Running ticket migration...
deno run --allow-read --allow-write --allow-run "%SCRIPT_DIR%\migrate-tickets.ts"

echo ✅ Migration complete