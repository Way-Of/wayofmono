# [WOW-054] VNC Viewer White Screen — x11vnc Segfault with Flutter GPU Window

## Problem Statement

Opening the VNC viewer at `/opticat/vnc/vnc.html?autoconnect=true&path=ws/opticat/vnc` shows a white/blank screen. The noVNC client connects via WebSocket but receives no framebuffer data because x11vnc is not running.

## Desired Outcome

Clicking "OptiCat App" in the navbar or "Open OptiCat" in the dashboard should reliably stream the OptiCat Flutter desktop app via VNC.

## Context & Background

### Current State
The `POST /api/opticat/launch` endpoint in `plugin/opticat/server/api.ts` searches for the Flutter window using `xdotool search --name hvac_service_app`. When found, it launches x11vnc with `-id <window_id>` to capture only that window. However, the Flutter app uses GPU-accelerated rendering (WebGPU) — the XGetImage call used by `-id` fails and causes x11vnc to segfault with "trapped GetImage at SUBWIN creation" messages.

This means:
1. The window IS found → x11vnc IS launched
2. x11vnc immediately crashes due to `-id` on the GPU surface
3. noVNC connects to the WebSocket proxy → proxy can't connect to x11vnc (not running on :5900) → white screen

The fallback Xvfb path doesn't have this issue (no `-id` flag used there), but it requires launching a second Flutter instance.

### Window name resolved
The xdotool search `--name hvac_service_app` correctly matches the Flutter window (`com.example.hvac_service_app` on display :1). The window exists; it's the `-id` flag that crashes x11vnc.

### Root Cause
x11vnc 0.9.16's `-id` flag uses `XGetImage()` to read window pixels, which fails on GPU-allocated window surfaces (Flutter/WebGPU, OpenGL, etc.). The SUBWIN trap and subsequent segfault confirm the incompatibility.

## Requirements

### Functional Requirements
- [ ] `POST /api/opticat/launch` must start x11vnc on the real display WITHOUT the `-id` flag when a Flutter window is detected
- [ ] x11vnc must not crash on startup
- [ ] noVNC viewer must show the full desktop (or the Flutter app window within it)
- [ ] The launch endpoint must still kill previous VNC processes before spawning new ones
- [ ] Add `-noxdamage` flag to avoid compositor-related update issues

### Out of Scope
- Capturing only the Flutter window without the full desktop background
- Fixing x11vnc to work with GPU-accelerated windows via `-id`
- Implementing any FLTK/OpenGL-based window capture alternatives

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [ ] Click "OptiCat App" in navbar → VNC viewer shows the OptiCat desktop app
- [ ] Click "Open OptiCat" in dashboard → VNC viewer shows the OptiCat desktop app
- [ ] x11vnc process stays alive and doesn't segfault
- [ ] VNC stream refreshes when Flutter app content changes

## Technical Notes

### Affected Components
- `plugin/opticat/server/api.ts:478-488` — Remove `-id` flag, add `-noxdamage` when capturing real display
- `plugin/opticat/bin/x11vnc` — x11vnc 0.9.16 binary (from Ubuntu noble)
- `plugin/opticat/bin/libvncserver.so.1` — Bundled library for x11vnc
- `server/vnc-proxy.ts` — WebSocket→TCP bridge (bun connect to 127.0.0.1:5900)

### Fix applied
The `-id windowId` argument was replaced with just `-display :1` full-display capture in commit. The x11vnc now runs with `-forever -shared -nopw -noxdamage` on the real display.

### Future improvement
If single-window capture is desired, consider `x11vnc -sid` (sub-window ID) or using `Xcomposite`/`XShmGetImage` based capture methods. For now, full-display capture is reliable.

---

## Meta

**Created**: 2026-06-05
**Priority**: High
**Estimated Effort**: S
