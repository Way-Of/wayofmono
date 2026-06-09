# Ticket Migration Script - PowerShell wrapper
# Usage: .\migrate-tickets.ps1

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Set-Location $ProjectRoot

Write-Host "🔄 Running ticket migration..." -ForegroundColor Cyan
deno run --allow-read --allow-write --allow-run "$ScriptDir\migrate-tickets.ts"

Write-Host "✅ Migration complete" -ForegroundColor Green