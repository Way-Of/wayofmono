@echo off
deno run --allow-read --allow-write "%~dp0dashboard.ts" %*
