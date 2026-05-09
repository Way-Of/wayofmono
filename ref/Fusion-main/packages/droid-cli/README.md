# @fusion/droid-cli

Compatibility shim package for Fusion's Droid integration.

Runtime/provider implementation now lives in:
- `@fusion-plugin-examples/droid-runtime` (`plugins/fusion-plugin-droid-runtime`)

This package preserves the historical pi extension entrypoint and delegates to the plugin-owned implementation so existing imports continue to work.
