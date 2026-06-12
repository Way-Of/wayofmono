<#
.SYNOPSIS
  AI Engineering Harness — Windows installer (PowerShell)
.DESCRIPTION
  Installs the AI Engineering Harness CLI and deploys skill/agent configs
  to all supported AI coding tools (OpenCode, Claude Code, Gemini CLI,
  Pi, Wo Coder, Antigravity, Codex).
.PARAMETER InstallCli
  Install or update the ai-harness CLI binary.
.PARAMETER Tool
  Install tool config(s). Use "all" for every tool.
  Examples: -Tool claude, -Tool "opencode,pi", -Tool all
.PARAMETER Update
  Full harness sync: CLI + docs + all tools + compliance check.
.PARAMETER Compliance
  Validate manifest integrity — checks for missing/stale/dangling files.
.PARAMETER Check
  Compare installed versions against manifest.
.PARAMETER Yes
  Skip confirmation prompts.
.PARAMETER DryRun
  Preview without writing files.
.PARAMETER Help
  Show this help message.
.EXAMPLE
  .\install.ps1 -InstallCli
  .\install.ps1 -Tool all -Yes
  .\install.ps1 -Update
  .\install.ps1 -Compliance
.LINK
  https://github.com/Way-Of/wayofmono
#>

param(
  [switch]$InstallCli,
  [string]$Tool,
  [switch]$Update,
  [switch]$Compliance,
  [switch]$Check,
  [switch]$Yes,
  [switch]$DryRun,
  [switch]$Help
)

$ScriptUrl = "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts"

function Write-Logo {
  $logo = @(
    "██╗    ██╗ ██████╗     ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗",
    "██║    ██║██╔═══██╗    ████╗ ████║██╔═══██╗████╗  ██║██╔═══██╗",
    "██║ █╗ ██║██║   ██║    ██╔████╔██║██║   ██║██╔██╗ ██║██║   ██║",
    "██║███╗██║██║   ██║    ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║",
    "╚███╔███╔╝╚██████╔╝    ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝",
    " ╚══╝╚══╝  ╚═════╝     ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝"
  )
  foreach ($line in $logo) { Write-Host "  $line" -ForegroundColor Cyan }
  Write-Host ""
}

function Write-Step {
  param([string]$Text)
  Write-Host "  ⟡ $Text" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Text)
  Write-Host "  ✓ $Text" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Text)
  Write-Host "  ⚠ $Text" -ForegroundColor Yellow
}

function Write-Err {
  param([string]$Text)
  Write-Host "  ✗ $Text" -ForegroundColor Red
}

function Test-Deno {
  try {
    $null = Get-Command deno -ErrorAction Stop
    return $true
  } catch {
    return $false
  }
}

function Install-Deno {
  Write-Step "Deno not found. Choose installation method:"
  Write-Host "  1) winget (recommended) — winget install DenoLand.Deno"
  Write-Host "  2) Official script  — iex (iwr https://deno.land/install.ps1)"
  Write-Host "  3) Skip — I'll install manually"
  $choice = Read-Host "  Enter 1, 2, or 3"
  switch ($choice) {
    "1" {
      Write-Step "Installing via winget..."
      winget install DenoLand.Deno
      if ($LASTEXITCODE -ne 0) { Write-Err "winget install failed."; return $false }
    }
    "2" {
      Write-Step "Installing via official script..."
      $env:DENO_INSTALL = Join-Path $env:USERPROFILE ".deno"
      iex (iwr https://deno.land/install.ps1 -useb)
      $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
      $denoBin = Join-Path $env:DENO_INSTALL "bin"
      if ($userPath -notlike "*$denoBin*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$denoBin", "User")
        $env:Path = "$env:Path;$denoBin"
      }
    }
    "3" {
      Write-Warn "Install Deno manually from https://deno.com/"
      return $false
    }
    default { Write-Err "Invalid choice."; return $false }
  }
  return (Test-Deno)
}

function Show-Help {
  Write-Logo
  Write-Host "  $("─" * 54)" -ForegroundColor DarkGray
  Write-Host "  AI Engineering Harness — Windows PowerShell Installer" -ForegroundColor Cyan
  Write-Host "  $("─" * 54)" -ForegroundColor DarkGray
  Write-Host ""
  Write-Host "  USAGE:" -ForegroundColor White
  Write-Host "    .\install.ps1 [-InstallCli] [-Tool <name>] [-Update] [-Compliance] [-Check] [-Yes] [-DryRun]"
  Write-Host ""
  Write-Host "  PARAMETERS:" -ForegroundColor White
  Write-Host "    -InstallCli     Install/update ai-harness CLI binary"
  Write-Host "    -Tool <name>    Install tool config (claude, opencode, gemini, pi, wocoder, antigravity, codex, all)"
  Write-Host "    -Update         Full harness sync: CLI + docs + all tools + compliance"
  Write-Host "    -Compliance     Validate all installed files match manifest"
  Write-Host "    -Check          Compare installed versions against manifest"
  Write-Host "    -Yes            Skip confirmation prompts"
  Write-Host "    -DryRun         Preview without writing files"
  Write-Host "    -Help           Show this help"
  Write-Host ""
  Write-Host "  EXAMPLES:" -ForegroundColor White
  Write-Host "    .\install.ps1 -InstallCli"
  Write-Host "    .\install.ps1 -Tool all -Yes"
  Write-Host "    .\install.ps1 -Update"
  Write-Host "    .\install.ps1 -Compliance"
  Write-Host ""
  Write-Host "  AFTER INSTALL:" -ForegroundColor White
  Write-Host "    Run ai-harness from any terminal: ai-harness --tool=claude"
  Write-Host "    Add $env:USERPROFILE\.deno\bin to your PATH if not already"
  Write-Host ""
}

function Main {
  if ($Help) { Show-Help; return }

  if (-not (Test-Deno)) {
    $ok = Install-Deno
    if (-not $ok) { Write-Err "Deno is required. Install it first."; exit 1 }
  }

  $denoArgs = @("run", "-A", $ScriptUrl)

  if ($InstallCli) { $denoArgs += "--install-cli" }
  if ($Update) { $denoArgs += "--update" }
  if ($Compliance) { $denoArgs += "--compliance" }
  if ($Check) { $denoArgs += "--check" }
  if ($Yes) { $denoArgs += "--yes" }
  if ($DryRun) { $denoArgs += "--dry-run" }
  if ($Tool) { $denoArgs += "--tool=$Tool" }

  if ($denoArgs.Count -eq 3 -and -not $Help) {
    Write-Warn "No action specified."
    Show-Help
    exit 1
  }

  Write-Logo
  Write-Step "deno $($denoArgs[1..$($denoArgs.Count-1)] -join ' ')"

  & deno $denoArgs[1..$($denoArgs.Count-1)]
  exit $LASTEXITCODE
}

Main
