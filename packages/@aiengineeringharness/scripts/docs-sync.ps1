# Documentation Sync - PowerShell wrapper
# Usage: .\docs-sync.ps1 [-Once] [-Watch] [-Status] [-Source "pi,gemini,opencode,claude,codex,antigravity"]

param(
    [switch]$Once,
    [switch]$Watch,
    [switch]$Status,
    [string]$Source
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Set-Location $ProjectRoot

$Args = @()
if ($Once) { $Args += "--once" }
if ($Watch) { $Args += "--watch" }
if ($Status) { $Args += "--status" }
if ($Source) { $Args += "--source=$Source" }

Write-Host "🔄 Running documentation sync..." -ForegroundColor Cyan
deno run --allow-read --allow-write --allow-net --allow-run --allow-env "$ScriptDir\docs-sync.ts" $Args

Write-Host "✅ Documentation sync complete" -ForegroundColor Green