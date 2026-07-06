#!/usr/bin/env python3
"""
Knowledge Database CLI — store, fetch, list, search, and manage learned knowledge.

Lives at: thoughts/global/knowledge/
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Resolve the knowledge root relative to this script's location.
# When run from the harness, we walk up to find thoughts/global/knowledge/.
SCRIPT_DIR = Path(__file__).resolve().parent
HARNESS_ROOT = SCRIPT_DIR.parent.parent.parent.parent  # scripts → knowledge → skills → @aiengineeringharness → packages
REPO_ROOT = HARNESS_ROOT.parent  # packages → repo root
KNOWLEDGE_ROOT = REPO_ROOT / "thoughts" / "global" / "knowledge"

TOPIC_SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
ENTRY_FILENAME_RE = re.compile(r"^([a-z0-9]+(-[a-z0-9]+)*)-(\d{3})\.md$")

SEED_TOPICS = [
    "ash",
    "docker",
    "postgres",
    "opentelemetry",
    "elixir",
    "deno",
    "react",
    "devops",
    "ai-tools",
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def ensure_dirs(topic: str | None = None):
    KNOWLEDGE_ROOT.mkdir(parents=True, exist_ok=True)
    if topic:
        (KNOWLEDGE_ROOT / topic).mkdir(parents=True, exist_ok=True)


def load_registry() -> dict:
    reg_path = KNOWLEDGE_ROOT / "knowledge-registry.json"
    if reg_path.exists():
        return json.loads(reg_path.read_text())
    return {"topics": {}, "total_entries": 0, "created": datetime.now().isoformat()}


def save_registry(reg: dict):
    reg["updated"] = datetime.now().isoformat()
    (KNOWLEDGE_ROOT / "knowledge-registry.json").write_text(
        json.dumps(reg, indent=2, ensure_ascii=False) + "\n"
    )


def load_topic_index(topic: str) -> list[dict]:
    idx_path = KNOWLEDGE_ROOT / topic / "index.json"
    if idx_path.exists():
        return json.loads(idx_path.read_text())
    return []


def save_topic_index(topic: str, entries: list[dict]):
    (KNOWLEDGE_ROOT / topic / "index.json").write_text(
        json.dumps(entries, indent=2, ensure_ascii=False) + "\n"
    )


def next_entry_number(topic: str) -> int:
    existing = list((KNOWLEDGE_ROOT / topic).glob(f"{topic}-*.md"))
    nums = []
    for f in existing:
        m = ENTRY_FILENAME_RE.match(f.name)
        if m:
            nums.append(int(m.group(4)))
    return max(nums, default=0) + 1


def parse_entry(filepath: Path) -> dict | None:
    """Parse a knowledge entry markdown file into a dict."""
    text = filepath.read_text()
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    frontmatter_str = parts[1].strip()
    body = parts[2].strip()
    meta = {}
    for line in frontmatter_str.splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if val.startswith("["):
                try:
                    val = json.loads(val)
                except json.JSONDecodeError:
                    pass
            meta[key] = val
    meta["_body"] = body
    meta["_file"] = str(filepath)
    return meta


def build_entry_md(meta: dict, body: str) -> str:
    """Build a markdown file with YAML frontmatter."""
    lines = ["---"]
    for key in ["id", "title", "topic", "tags", "source", "date", "confidence", "related", "deprecated"]:
        if key in meta:
            val = meta[key]
            if isinstance(val, list):
                val = json.dumps(val)
            elif isinstance(val, bool):
                val = "true" if val else "false"
            lines.append(f"{key}: {val}")
    lines.append("---")
    lines.append("")
    lines.append(body)
    return "\n".join(lines) + "\n"


def rebuild_topic_index(topic: str):
    """Rebuild index.json from actual .md files in the topic directory."""
    topic_dir = KNOWLEDGE_ROOT / topic
    entries = []
    for f in sorted(topic_dir.glob(f"{topic}-*.md")):
        meta = parse_entry(f)
        if meta:
            entries.append({
                "id": meta.get("id", ""),
                "title": meta.get("title", ""),
                "tags": meta.get("tags", []),
                "source": meta.get("source", ""),
                "date": meta.get("date", ""),
                "confidence": meta.get("confidence", ""),
                "deprecated": meta.get("deprecated", "false"),
                "file": f.name,
            })
    save_topic_index(topic, entries)
    return entries


def rebuild_registry():
    """Rebuild the full registry from all topic directories."""
    ensure_dirs()
    registry = {"topics": {}, "total_entries": 0, "created": datetime.now().isoformat()}
    for topic_dir in sorted(KNOWLEDGE_ROOT.iterdir()):
        if topic_dir.is_dir() and TOPIC_SLUG_RE.match(topic_dir.name):
            entries = rebuild_topic_index(topic_dir.name)
            active = [e for e in entries if e.get("deprecated") != "true"]
            registry["topics"][topic_dir.name] = {
                "count": len(active),
                "total": len(entries),
                "last_entry": entries[-1]["date"] if entries else None,
            }
            registry["total_entries"] += len(active)
    save_registry(registry)
    return registry


# ── Commands ─────────────────────────────────────────────────────────────────

def cmd_store(args):
    """Store a new knowledge entry."""
    topic = args.topic.lower().strip()
    if not TOPIC_SLUG_RE.match(topic):
        print(f"Error: Invalid topic slug '{topic}'. Use lowercase alphanumeric with dashes.", file=sys.stderr)
        sys.exit(1)

    ensure_dirs(topic)

    title = args.title
    tags = [t.strip() for t in args.tags.split(",")] if args.tags else []
    source = args.source or "session"
    confidence = args.confidence or "medium"
    content = args.content or ""

    # Read body from stdin if not provided via --content
    if not content and not sys.stdin.isatty():
        content = sys.stdin.read().strip()

    if not content:
        print("Error: No content provided. Use --content or pipe stdin.", file=sys.stderr)
        sys.exit(1)

    entry_num = next_entry_number(topic)
    entry_id = f"{topic}-{entry_num:03d}"
    now = datetime.now().strftime("%Y-%m-%d")

    meta = {
        "id": entry_id,
        "title": title,
        "topic": topic,
        "tags": tags,
        "source": source,
        "date": now,
        "confidence": confidence,
        "related": [],
        "deprecated": "false",
    }

    md = build_entry_md(meta, content)
    filepath = KNOWLEDGE_ROOT / topic / f"{entry_id}.md"
    filepath.write_text(md)

    # Update indexes
    entries = rebuild_topic_index(topic)
    save_topic_index(topic, entries)
    registry = load_registry()
    active_count = len([e for e in entries if e.get("deprecated") != "true"])
    registry["topics"][topic] = {
        "count": active_count,
        "total": len(entries),
        "last_entry": now,
    }
    registry["total_entries"] = sum(t["count"] for t in registry["topics"].values())
    save_registry(registry)

    print(f"Stored: {entry_id} — {title}")
    print(f"  Path: {filepath.relative_to(REPO_ROOT)}")
    print(f"  Topic: {topic} ({active_count} entries)")
    return entry_id


def cmd_list(args):
    """List knowledge entries."""
    if args.topic:
        topic = args.topic.lower().strip()
        entries = load_topic_index(topic)
        if not entries:
            print(f"No entries found for topic '{topic}'.")
            return
        print(f"\n  Topic: {topic} ({len(entries)} entries)\n")
        for e in entries:
            dep = " [DEPRECATED]" if e.get("deprecated") == "true" else ""
            tags = ", ".join(e.get("tags", [])) if e.get("tags") else ""
            print(f"  {e['id']}  {e['title']}{dep}")
            if tags:
                print(f"           tags: {tags}")
            print(f"           file: {e['file']}")
            print()
    else:
        registry = load_registry()
        if not registry["topics"]:
            print("Knowledge base is empty. Use '/knowledge store' to add entries.")
            return
        print(f"\n  Knowledge Topics ({registry['total_entries']} total entries)\n")
        for topic, info in sorted(registry["topics"].items()):
            print(f"  {topic:20s}  {info['count']:4d} entries  (last: {info.get('last_entry', '—')})")
        print()


def cmd_search(args):
    """Full-text search across all knowledge entries."""
    query = args.query.lower()
    results = []

    for topic_dir in sorted(KNOWLEDGE_ROOT.iterdir()):
        if not topic_dir.is_dir() or not TOPIC_SLUG_RE.match(topic_dir.name):
            continue
        for f in sorted(topic_dir.glob(f"{topic_dir.name}-*.md")):
            text = f.read_text().lower()
            if query in text:
                meta = parse_entry(f)
                if meta:
                    # Find matching lines for context
                    lines = text.splitlines()
                    matches = []
                    for i, line in enumerate(lines, 1):
                        if query in line:
                            matches.append(f"  L{i}: {line.strip()}")
                    results.append({
                        "id": meta.get("id", ""),
                        "title": meta.get("title", ""),
                        "topic": meta.get("topic", ""),
                        "file": str(f.relative_to(HARNESS_ROOT.parent)),
                        "matches": matches[:3],  # limit context
                    })

    if not results:
        print(f"No results for '{args.query}'.")
        return

    print(f"\n  Search: '{args.query}' — {len(results)} result(s)\n")
    for r in results:
        print(f"  [{r['topic']}] {r['id']} — {r['title']}")
        print(f"           {r['file']}")
        for m in r["matches"]:
            print(f"           {m}")
        print()


def cmd_topics(args):
    """List all topics with entry counts."""
    registry = load_registry()
    if not registry["topics"]:
        print("No topics yet. Store an entry to create one.")
        return
    print(f"\n  Topics ({len(registry['topics'])} total)\n")
    for topic, info in sorted(registry["topics"].items()):
        print(f"  {topic:20s}  {info['count']:4d} active  {info['total']:4d} total")
    print()


def cmd_stats(args):
    """Show knowledge base statistics."""
    registry = load_registry()
    total = registry.get("total_entries", 0)
    topics = registry.get("topics", {})

    print(f"\n  Knowledge Base Stats")
    print(f"  {'—' * 40}")
    print(f"  Total entries:    {total}")
    print(f"  Total topics:     {len(topics)}")

    if topics:
        top = max(topics.items(), key=lambda x: x[1]["count"])
        print(f"  Largest topic:    {top[0]} ({top[1]['count']} entries)")
        print(f"\n  Per-topic breakdown:")
        for topic, info in sorted(topics.items(), key=lambda x: -x[1]["count"]):
            print(f"    {topic:20s}  {info['count']:4d}")
    print()


def cmd_fetch(args):
    """Fetch/read a specific knowledge entry or topic."""
    if args.entry_id:
        # Fetch specific entry by ID
        parts = args.entry_id.rsplit("-", 1)
        if len(parts) == 2:
            topic_dir = KNOWLEDGE_ROOT / parts[0]
            if topic_dir.is_dir():
                for f in topic_dir.glob(f"{args.entry_id}.md"):
                    print(f.read_text())
                    return
        print(f"Entry '{args.entry_id}' not found.", file=sys.stderr)
        sys.exit(1)

    elif args.topic:
        # Fetch all entries in a topic
        topic = args.topic.lower().strip()
        topic_dir = KNOWLEDGE_ROOT / topic
        if not topic_dir.is_dir():
            print(f"Topic '{topic}' not found.", file=sys.stderr)
            sys.exit(1)
        files = sorted(topic_dir.glob(f"{topic}-*.md"))
        if not files:
            print(f"No entries in topic '{topic}'.")
            return
        for f in files:
            print(f.read_text())
            print("---\n")

    else:
        # Fetch everything
        for topic_dir in sorted(KNOWLEDGE_ROOT.iterdir()):
            if topic_dir.is_dir() and TOPIC_SLUG_RE.match(topic_dir.name):
                for f in sorted(topic_dir.glob(f"{topic_dir.name}-*.md")):
                    print(f.read_text())
                    print("---\n")


def cmd_rebuild(args):
    """Rebuild all indexes from actual files."""
    print("Rebuilding all indexes...")
    registry = rebuild_registry()
    print(f"  Topics: {len(registry['topics'])}")
    print(f"  Total entries: {registry['total_entries']}")
    for topic, info in sorted(registry["topics"].items()):
        print(f"    {topic}: {info['count']} active, {info['total']} total")
    print("Done.")


def cmd_init(args):
    """Initialize the knowledge base with seed topics."""
    ensure_dirs()
    for topic in SEED_TOPICS:
        ensure_dirs(topic)
    registry = load_registry()
    for topic in SEED_TOPICS:
        if topic not in registry["topics"]:
            registry["topics"][topic] = {"count": 0, "total": 0, "last_entry": None}
    save_registry(registry)
    print(f"Knowledge base initialized at: {KNOWLEDGE_ROOT.relative_to(HARNESS_ROOT.parent)}")
    print(f"  Seed topics: {', '.join(SEED_TOPICS)}")


# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Knowledge Database — store, fetch, and search learned knowledge.",
        prog="knowledge",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # store
    p_store = sub.add_parser("store", help="Store a new knowledge entry")
    p_store.add_argument("topic", help="Topic slug (e.g. docker, postgres, ash)")
    p_store.add_argument("title", help="Short descriptive title")
    p_store.add_argument("--tags", help="Comma-separated tags")
    p_store.add_argument("--source", choices=["session", "research", "debugging", "docs", "manual"], default="session")
    p_store.add_argument("--confidence", choices=["high", "medium", "low"], default="medium")
    p_store.add_argument("--content", help="Entry content (or pipe via stdin)")

    # list
    p_list = sub.add_parser("list", help="List entries")
    p_list.add_argument("topic", nargs="?", help="Filter by topic")

    # search
    p_search = sub.add_parser("search", help="Full-text search")
    p_search.add_argument("query", help="Search query")

    # fetch
    p_fetch = sub.add_parser("fetch", help="Fetch/read entries")
    p_fetch.add_argument("entry_id", nargs="?", help="Entry ID (e.g. docker-001)")
    p_fetch.add_argument("--topic", help="Fetch all entries in a topic")

    # topics
    sub.add_parser("topics", help="List all topics")

    # stats
    sub.add_parser("stats", help="Show statistics")

    # rebuild
    sub.add_parser("rebuild", help="Rebuild indexes from files")

    # init
    sub.add_parser("init", help="Initialize with seed topics")

    args = parser.parse_args()
    {
        "store": cmd_store,
        "list": cmd_list,
        "search": cmd_search,
        "fetch": cmd_fetch,
        "topics": cmd_topics,
        "stats": cmd_stats,
        "rebuild": cmd_rebuild,
        "init": cmd_init,
    }[args.command](args)


if __name__ == "__main__":
    main()
