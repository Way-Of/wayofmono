import json
import os

manifest_path = "/home/zerwiz/wayofmono/packages/@aiengineeringharness/manifest.json"

with open(manifest_path, "r") as f:
    manifest = json.load(f)

def update_paths(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if (key == "src" or key == "dest") and isinstance(value, str):
                if "build_" in value:
                    obj[key] = value.replace("build_", "build-")
            else:
                update_paths(value)
    elif isinstance(obj, list):
        for item in obj:
            update_paths(item)

update_paths(manifest)

with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)
