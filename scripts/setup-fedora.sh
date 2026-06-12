#!/bin/bash
set -e

REPO_PATH=$(pwd)
QUADLET_DIR="$HOME/.config/containers/systemd"

echo "→ Creating Quadlet directory: $QUADLET_DIR"
mkdir -p "$QUADLET_DIR"

echo "→ Building Next.js Dashboard image (wayofmono-nextjs)..."
podman build -t wayofmono-nextjs ./ui

echo "→ Copying and configuring Quadlets..."
for f in infra/quadlets/*; do
    filename=$(basename "$f")
    # If the user has an existing network, we could potentially swap wayofmono.network for theirs
    # For now, we allow them to manually edit the generated files in $QUADLET_DIR
    sed "s|<REPO_PATH>|$REPO_PATH|g" "$f" > "$QUADLET_DIR/$filename"
done

# If you want to use your existing Postgres or llama.cpp, you can disable the local ones:
# systemctl --user stop wayofmono-ollama.service
# systemctl --user disable wayofmono-ollama.service

echo "→ Copying Caddyfile to infra/podman/..."
# Already there, but let's ensure it's accessible for the container
mkdir -p "$REPO_PATH/infra/podman"

echo "→ Reloading systemd user daemon..."
systemctl --user daemon-reload

echo "→ Starting WayOfMono services..."
systemctl --user start wayofmono-ollama.service
systemctl --user start wayofmono-nextjs.service
systemctl --user start wayofmono-caddy.service

echo "→ Pulling default AI model (qwen3.5:9b) into Ollama..."
# Wait a bit for Ollama to start
sleep 5
podman exec -it wayofmono-ollama ollama pull qwen3.5:9b

echo "✅ Setup complete!"
echo "Dashboard should be available at http://localhost:81"
echo "Check status with: systemctl --user status wayofmono-nextjs.service"
echo "Check logs with: journalctl --user -u wayofmono-nextjs.service -f"
