# fusion-plugin-cursor-runtime

Cursor CLI-backed provider/runtime plugin for Fusion.

## Contract summary

- Provider ID: `cursor-cli`
- Binary probes: `cursor-agent`, then `cursor`
- Expected failure states: missing binary, missing Cursor IDE install, locked macOS keychain, unauthenticated runtime
- Model discovery: dynamic command probing (`models --json`, fallbacks) with dedupe + fallback metadata

## Notes

Status/auth and model discovery behavior follows `docs/cursor-cli-contract.md`.
