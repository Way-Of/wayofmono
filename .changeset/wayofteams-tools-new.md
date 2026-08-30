---
"@wayofmono/wayofteams-tools": minor
---

New `@wayofmono/wayofteams-tools` pi extension/package — full WayOfTeams MCP integration
(legacy `/mcp` + v2 domain-split) with a REST dual path. Client-first: per-user JWT token
resolution (env → pi settings.json → dashboard token file), multi-endpoint auto-probe
(v2 gateway → legacy → REST), dynamic tool loading via `pi.setActiveTools`, multi-agent
identity (WOTEAMS-322). Installs via `pi install npm:@wayofmono/wayofteams-tools`.