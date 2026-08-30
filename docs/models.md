# Models Configuration

Configure LLM models for Wo Coder and Wo User.

## Overview

Models are configured in `models.json` at:
- Global: `~/.wocode/models.json` or `~/.wouser/models.json`
- Project: `.wo/models.json`

## models.json Format

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "apiKey": "",
      "models": [
        "qwen3.5:9b",
        "qwen3.5:32b",
        "llama3.1:8b",
        "llama3.1:70b",
        "codellama:7b",
        "codellama:34b",
        "deepseek-coder:6.7b",
        "deepseek-coder:33b"
      ]
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "models": [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        "gpt-3.5-turbo"
      ]
    },
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}",
      "models": [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229"
      ]
    },
    "gemini": {
      "apiKey": "${GEMINI_API_KEY}",
      "models": [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b"
      ]
    }
  },
  "defaultProvider": "ollama",
  "defaultModel": "qwen3.5:9b",
  "modelAliases": {
    "fast": "qwen3.5:9b",
    "smart": "qwen3.5:32b",
    "coding": "deepseek-coder:33b"
  }
}
```

## Provider Configuration

### Ollama (Default, Local)

```json
"ollama": {
  "baseUrl": "http://localhost:11434",
  "models": ["qwen3.5:9b"]
}
```

Pull models:
```bash
ollama pull qwen3.5:9b
ollama pull llama3.1:8b
ollama pull deepseek-coder:33b
```

### OpenAI

```json
"openai": {
  "apiKey": "${OPENAI_API_KEY}",
  "organization": "${OPENAI_ORG_ID}",
  "models": ["gpt-4o", "gpt-4o-mini"]
}
```

### Anthropic

```json
"anthropic": {
  "apiKey": "${ANTHROPIC_API_KEY}",
  "models": ["claude-3-5-sonnet-20241022"]
}
```

### Gemini

```json
"gemini": {
  "apiKey": "${GEMINI_API_KEY}",
  "models": ["gemini-1.5-pro", "gemini-1.5-flash"]
}
```

### Azure OpenAI

```json
"azure": {
  "endpoint": "https://my-resource.openai.azure.com",
  "apiKey": "${AZURE_OPENAI_KEY}",
  "apiVersion": "2024-02-15-preview",
  "deployments": {
    "gpt-4o": "my-gpt4o-deployment",
    "gpt-4o-mini": "my-gpt4o-mini-deployment"
  }
}
```

### Custom Provider

```json
"custom": {
  "baseUrl": "https://api.custom.com/v1",
  "apiKey": "${CUSTOM_API_KEY}",
  "models": ["custom-model-v1"]
}
```

## Model Aliases

Shortcuts for quick model switching:

```json
"modelAliases": {
  "fast": "qwen3.5:9b",
  "smart": "qwen3.5:32b",
  "coding": "deepseek-coder:33b",
  "gpt4": "gpt-4o",
  "claude": "claude-3-5-sonnet-20241022"
}
```

Usage in TUI:
- Press `M` to cycle models
- Type alias name to switch

## Environment Variables

Reference env vars in config:

```json
{
  "providers": {
    "openai": {
      "apiKey": "${OPENAI_API_KEY}"
    }
  }
}
```

Supported:
- `${VAR_NAME}` — Required, errors if missing
- `${VAR_NAME:-default}` — Optional with default

## Per-Project Override

`.wo/models.json` merges with global:

```json
{
  "defaultProvider": "openai",
  "defaultModel": "gpt-4o"
}
```

## Model Capabilities

| Model | Context | Strengths |
|-------|---------|-----------|
| qwen3.5:9b | 32k | Fast, good coding |
| qwen3.5:32b | 32k | Smarter, slower |
| llama3.1:8b | 128k | General purpose |
| llama3.1:70b | 128k | Very capable |
| deepseek-coder:33b | 16k | Best for coding |
| gpt-4o | 128k | Best overall |
| gpt-4o-mini | 128k | Fast, cheap |
| claude-3.5-sonnet | 200k | Excellent reasoning |
| gemini-1.5-pro | 2M | Huge context |

## Auto-Discovery (Ollama)

Ollama models auto-discovered on startup:
```bash
ollama list
```

## Related

- [Custom Provider](custom-provider.md)
- [SDK](sdk.md)
- [Wo Coder Config](guides/wocode/#configuration)
- [Wo User Config](guides/wouser/#configuration)