@echo off
rem AI Harness /help Command — Windows batch wrapper
deno run --allow-read "%~dp0help.ts" %*
