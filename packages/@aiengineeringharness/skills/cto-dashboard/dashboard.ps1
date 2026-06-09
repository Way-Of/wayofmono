$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
deno run --allow-read --allow-write "$scriptDir/dashboard.ts" @args
