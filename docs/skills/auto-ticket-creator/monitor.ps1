$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
deno run --allow-read --allow-write --allow-run --allow-env --allow-net "$scriptDir/monitor.ts" @args
