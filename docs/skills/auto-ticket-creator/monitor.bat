@echo off
deno run --allow-read --allow-write --allow-run --allow-env --allow-net "%~dp0monitor.ts" %*
