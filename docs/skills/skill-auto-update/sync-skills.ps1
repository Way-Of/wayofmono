$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
deno run --allow-read --allow-write "$scriptDir/sync-skills.ts" @args
