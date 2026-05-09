---
"@runfusion/fusion": patch
---

Fix `fn plugin install` / `fn plugin add` path registration so local directory installs persist an absolute JavaScript entry file path instead of the source directory. This resolves plugin load failures on restart when loaders require a concrete JS module file.
