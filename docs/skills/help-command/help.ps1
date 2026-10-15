#!/usr/bin/env pwsh
# AI Harness /help Command — PowerShell wrapper
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
deno run --allow-read "$scriptDir/help.ts" @args
