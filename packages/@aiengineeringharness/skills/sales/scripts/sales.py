#!/usr/bin/env python3
"""
Sales Knowledge CLI — store, fetch, search, and manage sales knowledge.

Lives at: thoughts/global/sales/
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
HARNESS_ROOT = SCRIPT_DIR.parent.parent.parent
SALES_ROOT = HARNESS_ROOT.parent / "thoughts" / "global" / "sales"

CATEGORIES = ["playbook", "script", "research", "template"]

ENTRY_FILENAME_RE = re.compile(r"^([a-z-]+)-(\d{3})\.md$")


# ── Helpers ──────────────────────────────────────────────────────────────────

def ensure_dirs(category: str | None = None):
    SALES_ROOT.mkdir(parents=True, exist_ok=True)
    for cat in CATEGORIES:
        (SALES_ROOT / cat).mkdir(parents=True, exist_ok=True)


def load_registry() -> dict:
    reg_path = SALES_ROOT / "sales-registry.json"
    if reg_path.exists():
        return json.loads(reg_path.read_text())
    return {"categories": {}, "total_entries": 0, "created": datetime.now().isoformat()}


def save_registry(reg: dict):
    reg["updated"] = datetime.now().isoformat()
    (SALES_ROOT / "sales-registry.json").write_text(
        json.dumps(reg, indent=2, ensure_ascii=False) + "\n"
    )


def next_entry_number(category: str) -> int:
    cat_dir = SALES_ROOT / category
    existing = list(cat_dir.glob(f"{category}-*.md"))
    nums = []
    for f in existing:
        m = ENTRY_FILENAME_RE.match(f.name)
        if m:
            nums.append(int(m.group(2)))
    return max(nums, default=0) + 1


def parse_entry(filepath: Path) -> dict | None:
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
    lines = ["---"]
    for key in ["id", "title", "category", "tags", "source", "date", "confidence", "related", "deprecated"]:
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


def rebuild_category_index(category: str):
    cat_dir = SALES_ROOT / category
    entries = []
    for f in sorted(cat_dir.glob(f"{category}-*.md")):
        meta = parse_entry(f)
        if meta:
            entries.append({
                "id": meta.get("id", ""),
                "title": meta.get("title", ""),
                "tags": meta.get("tags", []),
                "source": meta.get("source", ""),
                "date": meta.get("date", ""),
                "deprecated": meta.get("deprecated", "false"),
                "file": f.name,
            })
    (cat_dir / "index.json").write_text(
        json.dumps(entries, indent=2, ensure_ascii=False) + "\n"
    )
    return entries


# ── Commands ─────────────────────────────────────────────────────────────────

def cmd_store(args):
    category = args.category.lower().strip()
    if category not in CATEGORIES:
        print(f"Error: Invalid category '{category}'. Must be: {', '.join(CATEGORIES)}", file=sys.stderr)
        sys.exit(1)

    ensure_dirs(category)

    title = args.title
    tags = [t.strip() for t in args.tags.split(",")] if args.tags else []
    source = args.source or "manual"
    confidence = args.confidence or "high"
    content = args.content or ""

    if not content and not sys.stdin.isatty():
        content = sys.stdin.read().strip()

    if not content:
        print("Error: No content provided. Use --content or pipe stdin.", file=sys.stderr)
        sys.exit(1)

    entry_num = next_entry_number(category)
    entry_id = f"{category}-{entry_num:03d}"
    now = datetime.now().strftime("%Y-%m-%d")

    meta = {
        "id": entry_id,
        "title": title,
        "category": category,
        "tags": tags,
        "source": source,
        "date": now,
        "confidence": confidence,
        "related": [],
        "deprecated": "false",
    }

    md = build_entry_md(meta, content)
    filepath = SALES_ROOT / category / f"{entry_id}.md"
    filepath.write_text(md)

    # Update index
    entries = rebuild_category_index(category)
    registry = load_registry()
    registry["categories"][category] = {
        "count": len([e for e in entries if e.get("deprecated") != "true"]),
        "total": len(entries),
        "last_entry": now,
    }
    registry["total_entries"] = sum(c["count"] for c in registry["categories"].values())
    save_registry(registry)

    print(f"Stored: {entry_id} — {title}")
    print(f"  Path: {filepath.relative_to(HARNESS_ROOT.parent)}")
    print(f"  Category: {category}")
    return entry_id


def cmd_fetch(args):
    if args.entry_id:
        parts = args.entry_id.rsplit("-", 1)
        if len(parts) == 2:
            for cat in CATEGORIES:
                cat_dir = SALES_ROOT / cat
                for f in cat_dir.glob(f"{args.entry_id}.md"):
                    print(f.read_text())
                    return
        print(f"Entry '{args.entry_id}' not found.", file=sys.stderr)
        sys.exit(1)

    elif args.category:
        cat = args.category.lower().strip()
        cat_dir = SALES_ROOT / cat
        if not cat_dir.is_dir():
            print(f"Category '{cat}' not found.", file=sys.stderr)
            sys.exit(1)
        files = sorted(cat_dir.glob(f"{cat}-*.md"))
        for f in files:
            print(f.read_text())
            print("---\n")

    else:
        for cat in CATEGORIES:
            cat_dir = SALES_ROOT / cat
            for f in sorted(cat_dir.glob(f"{cat}-*.md")):
                print(f.read_text())
                print("---\n")


def cmd_search(args):
    query = args.query.lower()
    results = []

    for cat in CATEGORIES:
        cat_dir = SALES_ROOT / cat
        if not cat_dir.is_dir():
            continue
        for f in sorted(cat_dir.glob(f"{cat}-*.md")):
            text = f.read_text().lower()
            if query in text:
                meta = parse_entry(f)
                if meta:
                    lines = text.splitlines()
                    matches = []
                    for i, line in enumerate(lines, 1):
                        if query in line:
                            matches.append(f"  L{i}: {line.strip()}")
                    results.append({
                        "id": meta.get("id", ""),
                        "title": meta.get("title", ""),
                        "category": meta.get("category", ""),
                        "file": str(f.relative_to(HARNESS_ROOT.parent)),
                        "matches": matches[:3],
                    })

    if not results:
        print(f"No results for '{args.query}'.")
        return

    print(f"\n  Search: '{args.query}' — {len(results)} result(s)\n")
    for r in results:
        print(f"  [{r['category']}] {r['id']} — {r['title']}")
        print(f"           {r['file']}")
        for m in r["matches"]:
            print(f"           {m}")
        print()


def cmd_list(args):
    registry = load_registry()
    if not registry["categories"]:
        print("Sales knowledge base is empty.")
        return
    print(f"\n  Sales Knowledge ({registry['total_entries']} total entries)\n")
    for cat, info in sorted(registry["categories"].items()):
        print(f"  {cat:15s}  {info['count']:4d} entries  (last: {info.get('last_entry', '—')})")
    print()


def cmd_stats(args):
    registry = load_registry()
    total = registry.get("total_entries", 0)
    cats = registry.get("categories", {})

    print(f"\n  Sales Knowledge Base Stats")
    print(f"  {'—' * 40}")
    print(f"  Total entries:    {total}")
    print(f"  Total categories: {len(cats)}")

    if cats:
        top = max(cats.items(), key=lambda x: x[1]["count"])
        print(f"  Largest category: {top[0]} ({top[1]['count']} entries)")
        print(f"\n  Per-category breakdown:")
        for cat, info in sorted(cats.items(), key=lambda x: -x[1]["count"]):
            print(f"    {cat:15s}  {info['count']:4d}")
    print()


def cmd_rebuild(args):
    print("Rebuilding all sales indexes...")
    ensure_dirs()
    registry = {"categories": {}, "total_entries": 0, "created": datetime.now().isoformat()}
    for cat in CATEGORIES:
        entries = rebuild_category_index(cat)
        active = [e for e in entries if e.get("deprecated") != "true"]
        if entries:
            registry["categories"][cat] = {
                "count": len(active),
                "total": len(entries),
                "last_entry": entries[-1].get("date"),
            }
            registry["total_entries"] += len(active)
    save_registry(registry)
    print(f"  Categories: {len(registry['categories'])}")
    print(f"  Total entries: {registry['total_entries']}")
    print("Done.")


def cmd_init(args):
    ensure_dirs()
    registry = load_registry()
    for cat in CATEGORIES:
        if cat not in registry["categories"]:
            registry["categories"][cat] = {"count": 0, "total": 0, "last_entry": None}
    save_registry(registry)
    print(f"Sales knowledge base initialized at: {SALES_ROOT.relative_to(HARNESS_ROOT.parent)}")
    print(f"  Categories: {', '.join(CATEGORIES)}")


# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Sales Knowledge — store, fetch, and search sales intelligence.",
        prog="sales",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_store = sub.add_parser("store", help="Store a sales knowledge entry")
    p_store.add_argument("category", help=f"Category ({', '.join(CATEGORIES)})")
    p_store.add_argument("title", help="Short descriptive title")
    p_store.add_argument("--tags", help="Comma-separated tags")
    p_store.add_argument("--source", choices=["manual", "session", "research"], default="manual")
    p_store.add_argument("--confidence", choices=["high", "medium", "low"], default="high")
    p_store.add_argument("--content", help="Entry content (or pipe via stdin)")

    p_fetch = sub.add_parser("fetch", help="Fetch/read entries")
    p_fetch.add_argument("entry_id", nargs="?", help="Entry ID (e.g. playbook-001)")
    p_fetch.add_argument("--category", help="Fetch all entries in a category")

    p_search = sub.add_parser("search", help="Full-text search")
    p_search.add_argument("query", help="Search query")

    p_list = sub.add_parser("list", help="List all entries")

    sub.add_parser("stats", help="Show statistics")
    sub.add_parser("rebuild", help="Rebuild indexes from files")
    sub.add_parser("init", help="Initialize sales knowledge base")

    args = parser.parse_args()
    {
        "store": cmd_store,
        "fetch": cmd_fetch,
        "search": cmd_search,
        "list": cmd_list,
        "stats": cmd_stats,
        "rebuild": cmd_rebuild,
        "init": cmd_init,
    }[args.command](args)


if __name__ == "__main__":
    main()
