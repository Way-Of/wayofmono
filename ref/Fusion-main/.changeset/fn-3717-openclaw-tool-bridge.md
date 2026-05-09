---
"@runfusion/fusion": minor
---

Enable Fusion tool-control support for the OpenClaw runtime plugin. OpenClaw sessions now derive custom tools from runtime session options, filter out built-in tools (`read`, `write`, `edit`, `bash`, `grep`, `find`), configure an MCP server via supported `openclaw mcp set` profile-based CLI flow, and pass that profile into `openclaw agent` calls while preserving default embedded `--local` behavior.