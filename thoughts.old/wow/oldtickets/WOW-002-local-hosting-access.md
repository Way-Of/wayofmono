# WOW-002 Enable Local Hosting for Remote Access

## Problem Statement

Currently, the system is set up for local development and access. To allow other team members or stakeholders to use the system, it needs to be accessible from this host machine over the network or via a secure tunnel.

## Desired Outcome

The system can be securely accessed by remote users via a stable URL or IP address, with proper authentication and environment configuration.

## Context & Background

### Current State (Findings)
- **Tunnel Gate:** `server/tunnel-gate.ts` implements a Basic Auth gate (`WOP_TUNNEL_GATE_HOST_MARKERS`) that triggers when the request `Host` looks like a public tunnel (e.g., ngrok).
- **Ngrok Manager:** `server/ngrok-tunnel-manager.ts` handles spawning ngrok and retrieving the public URL via the local inspector.
- **LAN Access:** `server/share-url-hints.ts` provides logic to guess the local LAN IPv4 and generate access URLs for other devices on the same Wi-Fi.
- **Vite Proxy:** The dev server handles proxying to the Bun backend, but host headers need careful management when accessed remotely.

### Important Note for Ngrok Message in `start.sh`
The ngrok message will only appear in the `start.sh` output if the `WOP_NGROK_DOMAIN` environment variable is set (e.g., in your `.env` file).

### Why This Matters
Much of the infrastructure for remote access is already built. The task is now to verify its functionality, ensure it's properly configured for the current environment, and document how to enable it safely.

## Requirements

### Functional Requirements
- [x] **Verify Tunnel Gate:** Test the `WOP_TUNNEL_GATE_HOST_MARKERS` logic with a real or simulated tunnel URL.
- [x] **Configure Basic Auth:** Ensure `tunnel-gate.v1.json` is correctly generated and stored in `WOP_HOME`.
- [x] **LAN Access Verification:** Verify the system is reachable via LAN IP (`guessLanIPv4`) and that Vite/Bun accept connections from `0.0.0.0`.
- [x] **Port Management:** Ensure the Vite port and Bun port are consistent and documented in `.env`.
- [x] **Electron Integration:** Ensure the Electron app can still function when the underlying server is exposed.

### Out of Scope
- Implementing a custom reverse proxy or load balancer.
- Hardening the OS firewall (should be handled by the user).

## Acceptance Criteria

### Automated Verification
- [x] `GET /api/dev/share-url-hints` returns the correct LAN URL.
- [x] Tunnel gate rejects requests without Basic Auth when coming from a tunnel host.

### Manual Verification
- [x] Access the system from a mobile device on the same Wi-Fi using the LAN URL.
- [x] Access the system from an external network via ngrok, prompted for Basic Auth, and successfully log in to the app.
## Technical Notes

### Affected Components
- `server/tunnel-gate.ts` - Basic Auth enforcement.
- `server/ngrok-tunnel-manager.ts` - Ngrok lifecycle.
- `server/share-url-hints.ts` - LAN discovery.
- `vite.config.ts` - Dev server host/port.
- `.env` - Required variables (`WOP_HOME`, `WOP_TUNNEL_GATE_HOST_MARKERS`, `WOP_ALLOW_NGROK_SPAWN`).

---

## Meta

**Created**: 2026-05-19
**Updated**: 2026-05-19 (After Initial Research)
**Priority**: Medium
**Estimated Effort**: M
