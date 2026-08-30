<#PSScriptInfo
.VERSION 1.0.0
.GUID 12345678-1234-1234-1234-123456789012
.AUTHOR WayOfMono
.COMPANYNAME WayOfMono
.COPYRIGHT Copyright (c) 2025 WayOfMono
.TAGS WayOfMono, CTO Dashboard, Electron, Next.js
.LICENSEURI MIT
.PROJECTURI https://github.com/Way-Of/wayofmono
.DESCRIPTION
    WayOfMono CTO Dashboard - Cross-platform start script (Windows PowerShell)
    Usage: .\start.ps1 [-Mode <dev|prod>]
#>

param(
    [ValidateSet('dev', 'development', 'prod', 'production', 'build')]
    [string]$Mode = 'dev'
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$UiDir = Join-Path $ScriptDir "ui"
$ThoughtsDir = Join-Path $ScriptDir "thoughts"

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('Info', 'Success', 'Warn', 'Error', 'Step')]
        [string]$Level = 'Info'
    )
    $colors = @{
        Info    = 'Cyan'
        Success = 'Green'
        Warn    = 'Yellow'
        Error   = 'Red'
        Step    = 'Blue'
    }
    $prefix = @{
        Info    = '[INFO]'
        Success = '[SUCCESS]'
        Warn    = '[WARN]'
        Error   = '[ERROR]'
        Step    = '[STEP]'
    }
    Write-Host "$($prefix[$Level]) $Message" -ForegroundColor $colors[$Level]
}

function Check-Command {
    param([string]$Command, [string]$VersionArg = '--version')
    try {
        $output = & $Command $VersionArg 2>$null | Select-Object -First 1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "$Command found: $output" -Level Success
            return $true
        }
    } catch {}
    Write-Log "$Command is not installed. Please install it first." -Level Error
    return $false
}

function Check-NodeVersion {
    try {
        $version = node --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "Node not found" }
        $major = [int]($version -replace '^v', '' -replace '\..*$', '')
        if ($major -lt 20) {
            Write-Log "Node.js >= 20 required, found $version" -Level Error
            return $false
        }
        Write-Log "Node.js $version (>= 20)" -Level Success
        return $true
    } catch {
        Write-Log "Failed to check Node.js version" -Level Error
        return $false
    }
}

function Check-PnpmVersion {
    try {
        $version = pnpm --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "pnpm not found" }
        $major = [int]($version -replace '\..*$', '')
        if ($major -lt 9) {
            Write-Log "pnpm >= 9 required, found $version" -Level Error
            return $false
        }
        Write-Log "pnpm $version (>= 9)" -Level Success
        return $true
    } catch {
        Write-Log "Failed to check pnpm version" -Level Error
        return $false
    }
}

function Check-BunVersion {
    try {
        $version = bun --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "bun not found" }
        Write-Log "bun $version" -Level Success
        return $true
    } catch {
        Write-Log "Failed to check bun version" -Level Error
        return $false
    }
}

function Sync-Forrad {
    Write-Log "Syncing f-rr-d (thoughts)..." -Level Step
    if (Test-Path (Join-Path $ThoughtsDir ".git")) {
        Push-Location $ThoughtsDir
        try {
            $result = git pull --ff-only 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log "f-rr-d synced successfully" -Level Success
            } else {
                Write-Log "f-rr-d sync had issues: $result" -Level Warn
            }
        } catch {
            Write-Log "f-rr-d sync error: $_" -Level Warn
        }
        Pop-Location
    } else {
        Write-Log "thoughts directory not found or not a git repo, skipping sync" -Level Warn
    }
}

function Install-Dependencies {
    Write-Log "Installing dependencies..." -Level Step
    Push-Location $UiDir
    try {
        if (Test-Path "pnpm-lock.yaml") {
            pnpm install --frozen-lockfile
        } else {
            pnpm install
        }
        Write-Log "Dependencies installed" -Level Success
    } catch {
        Write-Log "Failed to install dependencies: $_" -Level Error
        throw $_
    } finally {
        Pop-Location
    }
}

function Build-UI {
    Write-Log "Building UI for production..." -Level Step
    Push-Location $UiDir
    try {
        pnpm run build
        Write-Log "UI built successfully" -Level Success
    } catch {
        Write-Log "Failed to build UI: $_" -Level Error
        throw $_
    } finally {
        Pop-Location
    }
}

function Start-Dev {
    Write-Log "Starting development mode..." -Level Step
    Sync-Forrad
    Install-Dependencies

    Write-Log "Starting Electron + Next.js dev servers..." -Level Info
    Write-Log "Press Ctrl+C to stop all processes" -Level Info
    Push-Location $UiDir
    try {
        pnpm run electron:dev
    } catch {
        Write-Log "Development server error: $_" -Level Error
    } finally {
        Pop-Location
    }
}

function Start-Prod {
    Write-Log "Starting production mode..." -Level Step
    Sync-Forrad
    Install-Dependencies
    Build-UI

    Write-Log "Building Electron app..." -Level Info
    Push-Location $UiDir
    try {
        pnpm run electron:dist
        Write-Log "Electron app built in $UiDir/dist" -Level Success
    } catch {
        Write-Log "Failed to build Electron app: $_" -Level Error
        throw $_
    } finally {
        Pop-Location
    }
}

# Main
Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║         WayOfMono CTO Dashboard - Start Script             ║
║                    Windows PowerShell                       ║
╚══════════════════════════════════════════════════════════════╝
"@

Write-Log "Checking prerequisites..." -Level Step
$ok = $true
$ok = (Check-Command node) -and $ok
$ok = (Check-NodeVersion) -and $ok
$ok = (Check-Command pnpm) -and $ok
$ok = (Check-PnpmVersion) -and $ok
$ok = (Check-Command bun) -and $ok
$ok = (Check-BunVersion) -and $ok

if (-not $ok) {
    Write-Log "Prerequisites check failed" -Level Error
    exit 1
}

if (-not (Test-Path $UiDir)) {
    Write-Log "UI directory not found at $UiDir" -Level Error
    exit 1
}

switch ($Mode) {
    'dev' { Start-Dev }
    'development' { Start-Dev }
    'prod' { Start-Prod }
    'production' { Start-Prod }
    'build' { Start-Prod }
    default {
        Write-Log "Unknown mode: $Mode" -Level Error
        Write-Host "Usage: $($MyInvocation.MyCommand.Name) [-Mode dev|prod]"
        exit 1
    }
}