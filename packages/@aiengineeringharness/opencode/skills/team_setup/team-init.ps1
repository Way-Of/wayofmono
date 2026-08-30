#!/usr/bin/env pwsh
# Team Setup - PowerShell wrapper
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$HARNESS_DIR = Resolve-Path "$SCRIPT_DIR\..\.."
Push-Location $HARNESS_DIR
deno run --allow-read --allow-write --allow-run --allow-env "$SCRIPT_DIR\team-init.ts" @args
Pop-Location
