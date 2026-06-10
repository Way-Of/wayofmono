---
name: web-research
description: Search the web and extract content for research tasks. Use when you need current information, documentation, or facts from the internet.
---

# Web Research Skill

## Setup

```bash
cd /path/to/web-research && npm install
```

## Search the Web

```bash
# Basic search
web_search "query"

# Search with more results
web_search "query" 10

# Search with recency filter
web_search "recent news" --recency week
```

## Fetch URL Content

```bash
# Fetch a webpage
fetch_content "https://example.com"

# Fetch GitHub repo (auto-cloned locally)
fetch_content "https://github.com/owner/repo"

# Understand a YouTube video
fetch_content "https://youtube.com/watch?v=abc" "What is shown?"
```

## Research Workflow

1. **Define the question** — be specific about what you need
2. **Search broadly** — use `web_search` for overview
3. **Fetch specifics** — use `fetch_content` for detailed pages
4. **Verify** — cross-reference multiple sources
5. **Synthesize** — provide clear answer with citations

## Notes

- `web_search` tries Exa (zero-config), then Perplexity, then Gemini
- `fetch_content` handles web pages, GitHub repos, YouTube videos, PDFs
- Results include source citations automatically
