# Docs Sync Updater (PROJ-022) — delegates to scripts/docs-sync.ts
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$harnessDir = Resolve-Path "$scriptDir/../.."
deno run --allow-read --allow-write --allow-run --allow-env "$harnessDir/scripts/docs-sync.ts" @args
