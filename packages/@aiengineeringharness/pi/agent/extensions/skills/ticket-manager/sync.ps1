#!/usr/bin/env pwsh
# Ticket Manager Sync - PowerShell wrapper
# Usage: ./sync.ps1 --list
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$HARNESS_DIR = Resolve-Path "$SCRIPT_DIR/../.."
Push-Location $HARNESS_DIR
deno run --allow-read --allow-write --allow-run --allow-env "$SCRIPT_DIR/sync.ts" @args
Pop-Location
