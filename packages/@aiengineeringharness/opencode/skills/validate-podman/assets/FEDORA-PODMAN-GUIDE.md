# 🐧 Fedora Podman & Quadlet Deep Dive

This guide covers the technical implementation of our Podman-based infrastructure on Fedora.

## 🗂️ What are Quadlets?
Quadlets are a Podman feature that allows you to describe containers using a syntax similar to systemd unit files. Podman then automatically generates the underlying systemd services.

**Benefits:**
- **Automatic Lifecycle:** Containers start on boot and restart on failure via systemd.
- **Dependency Management:** Use `After=` and `Requires=` to order service startup (e.g., Start DB before App).
- **Security:** Fully rootless by default.

---

## 🏗️ Technical Architecture

### 1. Configuration Files (`infra/quadlets/`)
- `.container`: Defines the image, environment variables, ports, and volumes.
- `.volume`: Defines persistent named volumes.
- `.network`: Defines the bridge network.

### 2. The Setup Process (`scripts/setup-fedora.sh`)
The setup script performs the following steps:
1. **Path Resolution:** Detects the absolute path of the repo.
2. **Templating:** Replaces `<REPO_PATH>` placeholders in the Quadlets with the real path.
3. **Installation:** Copies the files to `~/.config/containers/systemd/`.
4. **Activation:** Triggers `systemctl --user daemon-reload`.

---

## 🔌 Service Integration (The "Infra-Aware" Part)

### Swapping the LLM Provider (llama.cpp)
If you are running `llama.cpp` in a container named `llama-srv` on the same network:
1. Open `~/.config/containers/systemd/wayofmono-nextjs.container`.
2. Change `Environment=OLLAMA_HOST=http://llama-srv:8080/v1`.
3. Run `systemctl --user restart wayofmono-nextjs.service`.

### External Postgres & PGVector
To move away from the local SQLite:
1. Update `DATABASE_URL` in the `.container` file.
2. Ensure the container can reach your Postgres host (may require adding `AddHost=` or adjusting `Network=`).

### Network Bridging
If you want to merge WayOfMono with another podman-managed system (like Honcho):
1. Identify the existing network name: `podman network ls`.
2. In the `.container` files, replace `Network=wayofmono.network` with `Network=your_existing_network`.

---

## 🛠️ Troubleshooting

### Logs
The standard `podman logs` works, but `journalctl` is often better for seeing startup failures:
```bash
journalctl --user -u wayofmono-nextjs.service -e
```

### Manual Service Generation
To see exactly what systemd files Podman generated from your Quadlets:
```bash
/usr/libexec/podman/quadlet --user --dry-run
```

### Directory Locations
- **Quadlets:** `~/.config/containers/systemd/`
- **Generated Units:** `/run/user/$(id -u)/systemd/generator/`
- **Local Data:** Named volumes are managed by Podman; bind mounts stay in the repo's `thoughts/` or `db/` folders.
