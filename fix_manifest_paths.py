
import json
import re

with open("packages/@aiengineeringharness/manifest.json", "r") as f:
    data = json.load(f)

# Tools that require underscores
underscore_tools = ["claude", "opencode", "gemini", "antigravity"]

for tool_name, tool_data in data["tools"].items():
    if tool_name in underscore_tools:
        for comp_name, comp_data in tool_data["components"].items():
            for file_entry in comp_data["files"]:
                file_entry["src"] = file_entry["src"].replace("-", "_")
                file_entry["dest"] = file_entry["dest"].replace("-", "_")

with open("packages/@aiengineeringharness/manifest.json", "w") as f:
    json.dump(data, f, indent=2)
