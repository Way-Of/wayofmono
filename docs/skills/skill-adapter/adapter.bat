@echo off
deno run --allow-read --allow-write "%~dp0adapter.ts" %*
