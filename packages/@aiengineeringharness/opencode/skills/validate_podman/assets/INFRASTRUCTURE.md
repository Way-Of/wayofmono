# 🏗️ WayOfMono Infrastructure Overview

Welcome to the WayOfMono Infrastructure! We use a **"Local-First, Infra-Aware"** philosophy to ensure development is fast, isolated, and flexible.

## 🌟 The Philosophy: "Infra-Aware"
Unlike traditional apps that are "black boxes," WayOfMono is designed to play nicely with what you already have.
- **Juniors:** You get a "one-command" setup that just works.
- **Seniors:** You can swap out any part (Database, LLM, Network) for your own high-performance infrastructure.

---

## 📦 1. Development Isolation (Devbox)
We use [Devbox](https://www.jetpack.io/devbox/) to ensure every developer has the exact same tools without polluting their host machine.

- **File:** `devbox.json`
- **What it does:** Installs Node.js, PNPM, Deno, Bun, and Podman in a temporary, isolated shell.
- **How to use:**
  ```bash
  devbox shell
  ```

---

## 🚢 2. Containerization (Podman Quadlets)
On Fedora, we use **Quadlets**. Think of them as "Docker Compose for Systemd." They are more secure (rootless) and more reliable (managed by the OS).

### The Stack:
1.  **Next.js Dashboard**: The central UI.
2.  **Caddy**: A high-performance reverse proxy (available at `localhost:81`).
3.  **Ollama**: Our local AI engine.
4.  **Internal Network**: All containers talk to each other securely on a private network.

---

## 🛠️ 3. How to Deploy (Fedora)
We've automated the heavy lifting.

1.  **Build & Configure:**
    ```bash
    ./scripts/setup-fedora.sh
    ```
    This script builds the images, generates the systemd services, and starts everything.

2.  **Monitor Services:**
    ```bash
    systemctl --user status wayofmono-nextjs.service
    journalctl --user -u wayofmono-nextjs.service -f
    ```

---

## 🔗 4. Flexibility (For Sr. Developers)
If you already have a Postgres DB or a `llama.cpp` server running, you don't need to use ours!

- **Point to your LLM:** Edit `OLLAMA_HOST` in `infra/quadlets/wayofmono-nextjs.container`.
- **Point to your DB:** Edit `DATABASE_URL` in the same file.
- **Join your Network:** Change the `Network=` line in any Quadlet to join your existing Podman network (e.g., your Honcho network).

---

## 📚 Further Reading
- [Fedora & Podman Deep Dive](./FEDORA-PODMAN-GUIDE.md) - For a detailed technical breakdown.
- [Deployment Architecture](./archetecture/deployment-architecture.md) - For the high-level system diagram.
