# Droid Runtime Plugin

First-class Droid runtime/provider plugin (`@fusion-plugin-examples/droid-runtime`).

## Purpose

This package is the canonical home for Droid-specific runtime behavior, including:
- provider id `droid-cli`
- model discovery + normalization
- CLI subprocess streaming + session resume
- MCP tool bridge + thinking effort mapping
- probe contract via `probeDroidBinary`

## Runtime + Provider

- Runtime ID: `droid`
- Display name: `Droid Runtime`
- Provider surface preserved: `Factory AI — via Droid CLI` (`droid-cli`)

Core implementation files live in `src/`:
- `runtime-adapter.ts`
- `provider.ts`
- `process-manager.ts`
- `probe.ts`
- prompt/tool/thinking/control helpers

## Dashboard UI contribution surfaces

The plugin registers `uiSlots` for:
- `settings-provider-card`
- `settings-integration-card`
- `onboarding-provider-card`
- `onboarding-setup-help`
- `post-onboarding-recommendation`

## Compatibility with `@fusion/droid-cli`

`packages/droid-cli` is now a thin compatibility shim. It keeps the historical pi-extension entrypoint, but delegates runtime/provider behavior to this plugin package.
