#!/usr/bin/env python3
"""
AMiner Open Platform API Client
Supports 6 academic data query workflows and all 28 independent APIs

Usage:
    python aminer_client.py --token <TOKEN> --action <ACTION> [options]

Workflows:
    scholar_profile   Scholar comprehensive analysis (search -> detail + figure + papers + patents + projects)
    paper_deep_dive   Paper deep mining (search -> detail + citation chain)
    org_analysis      Organization research power analysis (disambiguate -> detail + scholars + papers + patents)
    venue_papers      Venue paper monitoring (search -> detail + papers by year)
    paper_qa          Academic intelligent Q&A (AI-driven keyword search)
    patent_search     Patent search and detail
    scholar_patents   Get all patent details by scholar name

Direct single API call:
    raw               Direct call to any API, specify --api and --params

Console (generate Token): https://open.aminer.cn/open/board?tab=control
Documentation: https://open.aminer.cn/open/doc
"""

import argparse
import json
import sys
import time
import random
import urllib.request
import urllib.error
import urllib.parse
from typing import Any, Optional

BASE_URL = "https://datacenter.aminer.cn/gateway/open_platform"

TEST_TOKEN = ""  # Please go to https://open.aminer.cn/open/board?tab=control to generate your own Token

REQUEST_TIMEOUT_SECONDS = 30
MAX_RETRIES = 3
RETRYABLE_HTTP_STATUS = {408, 429, 500, 502, 503, 504}


# ──────────────────────────────────────────────────────────────────────────────
# Core HTTP utilities
# ──────────────────────────────────────────────────────────────────────────────

def _request(token: str, method: str, path: str,
             params: Optional[dict] = None,
             body: Optional[dict] = None) -> Any:
    """Send HTTP request and return parsed JSON data (with retries)."""
    url = BASE_URL + path
    headers = {
        "Authorization": token,
        "Content-Type": "application/json;charset=utf-8",
    }

    if method.upper() == "GET" and params:
        query = urllib.parse.urlencode(
            {k: (json.dumps(v) if isinstance(v, (list, dict)) else v)
             for k, v in params.items() if v is not None}
        )
        url = f"{url}?{query}"

    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method.upper())

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw)
        except urllib.error.HTTPError as e:
            body_bytes = e.read()
            try:
                err = json.loads(body_bytes)
            except Exception:
                err = body_bytes.decode("utf-8", errors="replace")
            retryable = e.code in RETRYABLE_HTTP_STATUS
            print(f"[HTTP {e.code}] {e.reason}: {err}", file=sys.stderr)
            if retryable and attempt < MAX_RETRIES:
                backoff = (2 ** (attempt - 1)) + random.uniform(0, 0.3)
                print(f"[Retry] attempt={attempt}/{MAX_RETRIES} wait={backoff:.2f}s", file=sys.stderr)
                time.sleep(backoff)
                continue
            return {
                "code": e.code,
                "success": False,
                "msg": str(e.reason),
                "error": err,
                "retryable": retryable,
            }
        except urllib.error.URLError as e:
            reason = str(getattr(e, "reason", e))
            print(f"[Request failed] {reason}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                backoff = (2 ** (attempt - 1)) + random.uniform(0, 0.3)
                print(f"[Retry] attempt={attempt}/{MAX_RETRIES} wait={backoff:.2f}s", file=sys.stderr)
                time.sleep(backoff)
                continue
            return {
                "code": -1,
                "success": False,
                "msg": "network_error",
                "error": reason,
                "retryable": True,
            }
        except TimeoutError as e:
            print(f"[Request timeout] {e}", file=sys.stderr)
            if attempt < MAX_RETRIES:
                backoff = (2 ** (attempt - 1)) + random.uniform(0, 0.3)
                print(f"[Retry] attempt={attempt}/{MAX_RETRIES} wait={backoff:.2f}s", file=sys.stderr)
                time.sleep(backoff)
                continue
            return {
                "code": -1,
                "success": False,
                "msg": "timeout",
                "error": str(e),
                "retryable": True,
            }
        except Exception as e:
            print(f"[Request failed] {e}", file=sys.stderr)
            return {
                "code": -1,
                "success": False,
                "msg": "unknown_error",
                "error": str(e),
                "retryable": False,
            }

    return {
        "code": -1,
        "success": False,
        "msg": "request_failed",
        "error": "max retries exceeded",
        "retryable": True,
    }


def _print(data: Any) -> None:
    """Format and print JSON result."""
    print(json.dumps(data, ensure_ascii=False, indent=2))


# ──────────────────────────────────────────────────────────────────────────────
# Paper APIs
# ──────────────────────────────────────────────────────────────────────────────

def paper_search(token: str, title: str, page: int = 0, size: int = 10) -> Any:
    """Paper Search (free): Search by title, returns ID/title/DOI."""
    return _request(token, "GET", "/api/paper/search",
                    params={"title": title, "page": page, "size": size})


def paper_search_pro(token: str, title: str = None, keyword: str = None,
                     abstract: str = None, author: str = None,
                     org: str = None, venue: str = None,
                     order: str = None, page: int = 0, size: int = 10) -> Any:
    """Paper Search Pro: Multi-condition search."""
    params = {"page": page, "size": size}
    for k, v in [("title", title), ("keyword", keyword), ("abstract", abstract),
                 ("author", author), ("org", org), ("venue", venue), ("order", order)]:
        if v is not None:
            params[k] = v
    return _request(token, "GET", "/api/paper/search/pro", params=params)


def paper_qa_search(token: str, query: str = None,
                    use_topic: bool = False,
                    topic_high: str = None, topic_middle: str = None, topic_low: str = None,
                    title: list = None, doi: str = None, year: list = None,
                    sci_flag: bool = False, n_citation_flag: bool = False,
                    force_citation_sort: bool = False, force_year_sort: bool = False,
                    author_terms: list = None, org_terms: list = None,
                    size: int = 10, offset: int = 0) -> Any:
    """Paper QA Search: AI intelligent Q&A, supports natural language and structured keywords."""
    body: dict = {"use_topic": use_topic, "size": size, "offset": offset}
    if query:
        body["query"] = query
    if topic_high:
        body["topic_high"] = topic_high
    if topic_middle:
        body["topic_middle"] = topic_middle
    if topic_low:
        body["topic_low"] = topic_low
    if title:
        body["title"] = title
    if doi:
        body["doi"] = doi
    if year:
        body["year"] = year
    if sci_flag:
        body["sci_flag"] = True
    if n_citation_flag:
        body["n_citation_flag"] = True
    if force_citation_sort:
        body["force_citation_sort"] = True
    if force_year_sort:
        body["force_year_sort"] = True
    if author_terms:
        body["author_terms"] = author_terms
    if org_terms:
        body["org_terms"] = org_terms
    return _request(token, "POST", "/api/paper/qa/search", body=body)


def paper_info(token: str, ids: list) -> Any:
    """Paper Info (free): Batch get basic info by ID."""
    return _request(token, "POST", "/api/paper/info", body={"ids": ids})


def paper_detail(token: str, paper_id: str) -> Any:
    """Paper Detail: Get full paper info."""
    return _request(token, "GET", "/api/paper/detail", params={"id": paper_id})


def paper_relation(token: str, paper_id: str) -> Any:
    """Paper Citation: Get other papers cited by this paper."""
    return _request(token, "GET", "/api/paper/relation", params={"id": paper_id})


def paper_list_by_search_venue(token: str, keyword: str = None, venue: str = None,
                                author: str = None, order: str = None,
                                page: int = 0, size: int = 10) -> Any:
    """Paper Comprehensive Search: Get full paper info by keyword/venue/author."""
    params = {"page": page, "size": size}
    for k, v in [("keyword", keyword), ("venue", venue), ("author", author), ("order", order)]:
        if v is not None:
            params[k] = v
    return _request(token, "GET", "/api/paper/list/by/search/venue", params=params)


def paper_list_by_keywords(token: str, keywords: list, page: int = 0, size: int = 10) -> Any:
    """Paper Batch Query: Multi-keyword get paper abstract etc."""
    params = {"page": page, "size": size, "keywords": json.dumps(keywords, ensure_ascii=False)}
    return _request(token, "GET", "/api/paper/list/citation/by/keywords", params=params)


def paper_detail_by_condition(token: str, year: int, venue_id: str = None) -> Any:
    """Paper Detail by Year and Venue: year and venue_id must be passed together, only year returns null."""
    params: dict = {"year": year}
    if venue_id:
        params["venue_id"] = venue_id
    return _request(token, "GET",
                    "/api/paper/platform/allpubs/more/detail/by/ts/org/venue",
                    params=params)


# ──────────────────────────────────────────────────────────────────────────────
# Scholar APIs
# ──────────────────────────────────────────────────────────────────────────────

def person_search(token: str, name: str = None, org: str = None,
                  org_id: list = None, offset: int = 0, size: int = 5) -> Any:
    """Scholar Search (free): Search scholars by name/organization."""
    body: dict = {"offset": offset, "size": size}
    if name:
        body["name"] = name
    if org:
        body["org"] = org
    if org_id:
        body["org_id"] = org_id
    return _request(token, "POST", "/api/person/search", body=body)


def person_detail(token: str, person_id: str) -> Any:
    """Scholar Detail: Get full personal info."""
    return _request(token, "GET", "/api/person/detail", params={"id": person_id})


def person_figure(token: str, person_id: str) -> Any:
    """Scholar Figure: Get research interests, domain and structured history."""
    return _request(token, "GET", "/api/person/figure", params={"id": person_id})


def person_paper_relation(token: str, person_id: str) -> Any:
    """Scholar Papers: Get scholar's published paper list."""
    return _request(token, "GET", "/api/person/paper/relation", params={"id": person_id})


def person_patent_relation(token: str, person_id: str) -> Any:
    """Scholar Patents: Get scholar's patent list."""
    return _request(token, "GET", "/api/person/patent/relation", params={"id": person_id})


def person_project(token: str, person_id: str) -> Any:
    """Scholar Projects: Get research projects (funding amount/time/source)."""
    return _request(token, "GET", "/api/project/person/v3/open", params={"id": person_id})


# ──────────────────────────────────────────────────────────────────────────────
# Organization APIs
# ──────────────────────────────────────────────────────────────────────────────

def org_search(token: str, orgs: list) -> Any:
    """Organization Search (free): Search organizations by keyword."""
    return _request(token, "POST", "/api/organization/search", body={"orgs": orgs})


def org_detail(token: str, ids: list) -> Any:
    """Organization Detail: Get org detail by ID."""
    return _request(token, "POST", "/api/organization/detail", body={"ids": ids})


def org_person_relation(token: str, org_id: str, offset: int = 0) -> Any:
    """Organization Scholars: Get scholar list under org (10 per call)."""
    return _request(token, "GET", "/api/organization/person/relation",
                    params={"org_id": org_id, "offset": offset})


def org_paper_relation(token: str, org_id: str, offset: int = 0) -> Any:
    """Organization Papers: Get paper list published by org scholars (10 per call)."""
    return _request(token, "GET", "/api/organization/paper/relation",
                    params={"org_id": org_id, "offset": offset})


def org_patent_relation(token: str, org_id: str,
                        page: int = 1, page_size: int = 100) -> Any:
    """Organization Patents: Get patent list owned by org, supports pagination (page_size max 10000)."""
    return _request(token, "GET", "/api/organization/patent/relation",
                    params={"id": org_id, "page": page, "page_size": page_size})


def org_disambiguate(token: str, org: str) -> Any:
    """Organization Disambiguation: Get standardized organization name."""
    return _request(token, "POST", "/api/organization/na", body={"org": org})


def org_disambiguate_pro(token: str, org: str) -> Any:
    """Organization Disambiguation Pro: Extract primary and secondary organization IDs."""
    return _request(token, "POST", "/api/organization/na/pro", body={"org": org})


# ──────────────────────────────────────────────────────────────────────────────
# Venue APIs
# ──────────────────────────────────────────────────────────────────────────────

def venue_search(token: str, name: str) -> Any:
    """Venue Search (free): Search venue ID and standard name by name."""
    return _request(token, "POST", "/api/venue/search", body={"name": name})


def venue_detail(token: str, venue_id: str) -> Any:
    """Venue Detail: Get ISSN, abbreviation, type, etc."""
    return _request(token, "POST", "/api/venue/detail", body={"id": venue_id})


def venue_paper_relation(token: str, venue_id: str, offset: int = 0,
                         limit: int = 20, year: Optional[int] = None) -> Any:
    """Venue Papers: Get venue paper list (supports year filter)."""
    body: dict = {"id": venue_id, "offset": offset, "limit": limit}
    if year is not None:
        body["year"] = year
    return _request(token, "POST", "/api/venue/paper/relation", body=body)


# ──────────────────────────────────────────────────────────────────────────────
# Patent APIs
# ──────────────────────────────────────────────────────────────────────────────

def patent_search(token: str, query: str, page: int = 0, size: int = 10) -> Any:
    """Patent Search (free): Search patents by name/keywords."""
    return _request(token, "POST", "/api/patent/search",
                    body={"query": query, "page": page, "size": size})


def patent_info(token: str, patent_id: str) -> Any:
    """Patent Info (free): Get basic patent info (title/patent number/inventor)."""
    return _request(token, "GET", "/api/patent/info", params={"id": patent_id})


def patent_detail(token: str, patent_id: str) -> Any:
    """Patent Detail: Get full patent info (abstract/application date/IPC etc)."""
    return _request(token, "GET", "/api/patent/detail", params={"id": patent_id})


# ──────────────────────────────────────────────────────────────────────────────
# Combined Workflows
# ──────────────────────────────────────────────────────────────────────────────

def workflow_scholar_profile(token: str, name: str) -> dict:
    """
    Workflow 1: Scholar Comprehensive Analysis
    Search scholar -> detail + figure + papers + patents + projects
    """
    print(f"[1/6] Searching scholar: {name}", file=sys.stderr)
    search_result = person_search(token, name=name, size=5)
    if not search_result or not search_result.get("data"):
        return {"error": f"Scholar not found: {name}"}

    candidates = search_result["data"]
    scholar = candidates[0]
    person_id = scholar.get("id") or scholar.get("_id")
    print(f"      Found: {scholar.get('name')} ({scholar.get('org')}), ID={person_id}", file=sys.stderr)

    result = {
        "source_api_chain": [
            "person_search",
            "person_detail",
            "person_figure",
            "person_paper_relation",
            "person_patent_relation",
            "person_project",
        ],
        "search_candidates": candidates[:3],
        "selected": {
            "id": person_id,
            "name": scholar.get("name"),
            "name_zh": scholar.get("name_zh"),
            "org": scholar.get("org"),
            "interests": scholar.get("interests"),
            "n_citation": scholar.get("n_citation"),
        }
    }

    print("[2/6] Getting scholar detail...", file=sys.stderr)
    detail = person_detail(token, person_id)
    if detail and detail.get("data"):
        result["detail"] = detail["data"]

    print("[3/6] Getting scholar figure...", file=sys.stderr)
    figure = person_figure(token, person_id)
    if figure and figure.get("data"):
        result["figure"] = figure["data"]

    print("[4/6] Getting scholar papers...", file=sys.stderr)
    papers = person_paper_relation(token, person_id)
    if papers and papers.get("data"):
        result["papers"] = papers["data"][:20]
        result["papers_total"] = papers.get("total", len(papers["data"]))

    print("[5/6] Getting scholar patents...", file=sys.stderr)
    patents = person_patent_relation(token, person_id)
    if patents and patents.get("data"):
        result["patents"] = patents["data"][:10]

    print("[6/6] Getting scholar projects...", file=sys.stderr)
    projects = person_project(token, person_id)
    if projects and projects.get("data"):
        result["projects"] = projects["data"][:10]

    return result


def workflow_paper_deep_dive(token: str, title: str = None, keyword: str = None,
                              author: str = None, order: str = "n_citation") -> dict:
    """
    Workflow 2: Paper Deep Mining
    Search paper -> detail + citation chain + cited paper basic info
    """
    print(f"[1/4] Searching paper: title={title}, keyword={keyword}", file=sys.stderr)
    if keyword or author:
        search_result = paper_search_pro(token, title=title, keyword=keyword,
                                         author=author, order=order, size=5)
        search_api = "paper_search_pro"
    else:
        search_result = paper_search(token, title=title or keyword, size=5)
        search_api = "paper_search"
        if not search_result or not search_result.get("data"):
            # Fallback to pro search when title search yields no results
            print("      No results from title search, falling back to paper_search_pro...", file=sys.stderr)
            search_result = paper_search_pro(token, title=title, keyword=title,
                                             author=author, order=order, size=5)
            search_api = "paper_search_pro(fallback)"

    if not search_result or not search_result.get("data"):
        return {"error": "No related papers found"}

    papers = search_result["data"]
    top_paper = papers[0]
    paper_id = top_paper.get("id") or top_paper.get("_id")
    print(f"      Found: {top_paper.get('title')[:60]}, ID={paper_id}", file=sys.stderr)

    result = {
        "source_api_chain": [
            search_api,
            "paper_detail",
            "paper_relation",
            "paper_info",
        ],
        "search_candidates": papers[:5],
        "selected_id": paper_id,
        "selected_title": top_paper.get("title"),
    }

    print("[2/4] Getting paper detail...", file=sys.stderr)
    detail = paper_detail(token, paper_id)
    if detail and detail.get("data"):
        result["detail"] = detail["data"]

    print("[3/4] Getting citation relations...", file=sys.stderr)
    relation = paper_relation(token, paper_id)
    if relation and relation.get("data"):
        # data structure: [{"_id": "<paper_id>", "cited": [{...}, ...]}]
        # outer array is paper-level wrapper, actual citation list is in cited field
        all_cited = []
        for item in relation["data"]:
            all_cited.extend(item.get("cited") or [])
        result["citations_count"] = len(all_cited)
        result["citations_preview"] = all_cited[:10]

        # Batch get cited paper basic info
        cited_ids = [c.get("_id") or c.get("id") for c in all_cited[:20]
                     if c.get("_id") or c.get("id")]
        if cited_ids:
            print(f"[4/4] Batch getting {len(cited_ids)} cited papers info...", file=sys.stderr)
            info = paper_info(token, cited_ids)
            if info and info.get("data"):
                result["cited_papers_info"] = info["data"]
        else:
            print("[4/4] Skipped (no cited IDs)", file=sys.stderr)
    else:
        print("[4/4] Skipped (no citation data)", file=sys.stderr)

    return result


def workflow_org_analysis(token: str, org: str) -> dict:
    """
    Workflow 3: Organization Research Power Analysis
    Org disambiguate pro -> detail + scholars + papers + patents
    """
    print(f"[1/5] Organization disambiguation: {org}", file=sys.stderr)
    disamb = org_disambiguate_pro(token, org)
    org_id = None

    if disamb and disamb.get("data"):
        data = disamb["data"]
        if isinstance(data, list) and data:
            first = data[0]
            org_id = first.get("ID") or first.get("ID")
        elif isinstance(data, dict):
            org_id = data.get("ID") or data.get("ID")

    if not org_id:
        print("      Disambiguation pro returned no ID, trying org search...", file=sys.stderr)
        search_r = org_search(token, [org])
        if search_r and search_r.get("data"):
            orgs = search_r["data"]
            org_id = orgs[0].get("org_id") if orgs else None

    if not org_id:
        return {"error": f"Cannot find organization ID: {org}"}

    print(f"      Organization ID: {org_id}", file=sys.stderr)
    result = {
        "source_api_chain": [
            "org_disambiguate_pro",
            "org_detail",
            "org_person_relation",
            "org_paper_relation",
            "org_patent_relation",
        ],
        "org_query": org,
        "org_id": org_id,
        "disambiguate": disamb,
    }

    print("[2/5] Getting organization detail...", file=sys.stderr)
    detail = org_detail(token, [org_id])
    if detail and detail.get("data"):
        result["detail"] = detail["data"]

    print("[3/5] Getting organization scholars (top 10)...", file=sys.stderr)
    scholars = org_person_relation(token, org_id, offset=0)
    if scholars and scholars.get("data"):
        result["scholars"] = scholars["data"]
        result["scholars_total"] = scholars.get("total", len(scholars["data"]))

    print("[4/5] Getting organization papers (top 10)...", file=sys.stderr)
    papers = org_paper_relation(token, org_id, offset=0)
    if papers and papers.get("data"):
        result["papers"] = papers["data"]
        result["papers_total"] = papers.get("total", len(papers["data"]))

    print("[5/5] Getting organization patents (up to 100)...", file=sys.stderr)
    patents = org_patent_relation(token, org_id, page=1, page_size=100)
    if patents and patents.get("data"):
        result["patents"] = patents["data"]
        result["patents_total"] = patents.get("total", len(patents["data"]))

    return result


def workflow_venue_papers(token: str, venue: str, year: Optional[int] = None,
                           limit: int = 20) -> dict:
    """
    Workflow 4: Venue Paper Monitoring
    Venue search -> venue detail + get papers by year
    """
    print(f"[1/3] Searching venue: {venue}", file=sys.stderr)
    search_result = venue_search(token, venue)
    if not search_result or not search_result.get("data"):
        return {"error": f"Venue not found: {venue}"}

    venues = search_result["data"]
    top_venue = venues[0]
    venue_id = top_venue.get("id")
    print(f"      Found: {top_venue.get('name_en')}, ID={venue_id}", file=sys.stderr)
    result = {
        "source_api_chain": [
            "venue_search",
            "venue_detail",
            "venue_paper_relation",
        ],
        "search_candidates": venues[:3],
        "venue_id": venue_id,
    }

    print("[2/3] Getting venue detail...", file=sys.stderr)
    detail = venue_detail(token, venue_id)
    if detail and detail.get("data"):
        result["venue_detail"] = detail["data"]

    print(f"[3/3] Getting venue papers (year={year}, limit={limit})...", file=sys.stderr)
    papers = venue_paper_relation(token, venue_id, year=year, limit=limit)
    if papers and papers.get("data"):
        result["papers"] = papers["data"]
        result["papers_total"] = papers.get("total", len(papers["data"]))

    return result


def workflow_paper_qa(token: str, query: str = None,
                      topic_high: str = None, topic_middle: str = None,
                      sci_flag: bool = False, sort_citation: bool = False,
                      size: int = 10) -> dict:
    """
    Workflow 5: Academic Intelligent Q&A
    Use AI-driven paper QA search API
    """
    use_topic = topic_high is not None
    print(f"[1/1] Academic QA search: query={query}, use_topic={use_topic}", file=sys.stderr)
    qa_result = paper_qa_search(
        token, query=query, use_topic=use_topic,
        topic_high=topic_high, topic_middle=topic_middle,
        sci_flag=sci_flag, force_citation_sort=sort_citation,
        size=size
    )
    if qa_result and qa_result.get("code") == 200 and qa_result.get("data"):
        qa_result["source_api_chain"] = ["paper_qa_search"]
        qa_result["route"] = "paper_qa_search"
        return qa_result

    # Fallback to pro search when query mode yields no results
    if query:
        print("      paper_qa_search returned no results, falling back to paper_search_pro...", file=sys.stderr)
        fallback = paper_search_pro(token, keyword=query, order="n_citation", size=size)
        data = (fallback or {}).get("data") or []
        return {
            "code": 200 if data else (qa_result or {}).get("code", -1),
            "success": bool(data),
            "msg": "" if data else "no data",
            "data": data,
            "total": (fallback or {}).get("total", len(data)),
            "route": "paper_qa_search -> paper_search_pro",
            "source_api_chain": ["paper_qa_search", "paper_search_pro"],
            "primary_result": qa_result,
        }

    if isinstance(qa_result, dict):
        qa_result["source_api_chain"] = ["paper_qa_search"]
        qa_result["route"] = "paper_qa_search"
    return qa_result


def workflow_patent_search(token: str, query: str, page: int = 0, size: int = 10) -> dict:
    """
    Workflow 6: Patent Search and Detail
    Patent search -> get detail for each patent
    """
    print(f"[1/2] Searching patents: {query}", file=sys.stderr)
    search_result = patent_search(token, query, page=page, size=size)
    if not search_result or not search_result.get("data"):
        return {"error": f"No patents found: {query}"}

    patents = search_result["data"]
    result = {
        "source_api_chain": ["patent_search", "patent_detail"],
        "search_results": patents,
        "total": len(patents),
    }

    print(f"[2/2] Getting details for top {min(3, len(patents))} patents...", file=sys.stderr)
    details = []
    for p in patents[:3]:
        pid = p.get("id")
        if pid:
            d = patent_detail(token, pid)
            if d and d.get("data"):
                details.append(d["data"])
    result["details"] = details
    return result


def workflow_scholar_patents(token: str, name: str) -> dict:
    """
    Get patent list + detail for each patent by scholar name
    """
    print(f"[1/3] Searching scholar: {name}", file=sys.stderr)
    search_result = person_search(token, name=name, size=3)
    if not search_result or not search_result.get("data"):
        return {"error": f"Scholar not found: {name}"}

    scholar = search_result["data"][0]
    person_id = scholar.get("id")
    print(f"      Found: {scholar.get('name')}, ID={person_id}", file=sys.stderr)
    result = {"scholar": scholar}

    print("[2/3] Getting scholar patent list...", file=sys.stderr)
    patents = person_patent_relation(token, person_id)
    if not patents or not patents.get("data"):
        return {**result, "patents": [], "error": "No patent data for this scholar"}
    patent_list = patents["data"]
    result["patents_list"] = patent_list

    print(f"[3/3] Getting details for top {min(3, len(patent_list))} patents...", file=sys.stderr)
    details = []
    for p in patent_list[:3]:
        pid = p.get("patent_id")
        if pid:
            d = patent_detail(token, pid)
            if d and d.get("data"):
                details.append(d["data"])
    result["patent_details"] = details
    return result


# ──────────────────────────────────────────────────────────────────────────────
# CLI entry point
# ──────────────────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="AMiner Open Platform Academic Data Query Client",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scholar comprehensive analysis
  python aminer_client.py --token <TOKEN> --action scholar_profile --name "Andrew Ng"

  # Paper deep mining
  python aminer_client.py --token <TOKEN> --action paper_deep_dive --title "BERT"
  python aminer_client.py --token <TOKEN> --action paper_deep_dive --keyword "large language model" --author "Hinton"

  # Organization research power analysis
  python aminer_client.py --token <TOKEN> --action org_analysis --org "Tsinghua University"

  # Venue paper monitoring
  python aminer_client.py --token <TOKEN> --action venue_papers --venue "NeurIPS" --year 2023

  # Academic intelligent Q&A
  python aminer_client.py --token <TOKEN> --action paper_qa --query "protein structure deep learning"
  python aminer_client.py --token <TOKEN> --action paper_qa \\
    --topic_high '[["transformer","self-attention"],["protein folding"]]' \\
    --sci_flag --sort_citation

  # Patent search
  python aminer_client.py --token <TOKEN> --action patent_search --query "quantum computing chip"

  # Scholar patents
  python aminer_client.py --token <TOKEN> --action scholar_patents --name "Scholar Name"

  # Direct single API call
  python aminer_client.py --token <TOKEN> --action raw \\
    --api paper_search --params '{"title":"BERT","page":0,"size":5}'

Console (generate Token): https://open.aminer.cn/open/board?tab=control
Documentation: https://open.aminer.cn/open/doc
        """
    )
    p.add_argument("--token", default=TEST_TOKEN,
                   help="AMiner API Token (generate at https://open.aminer.cn/open/board?tab=control)")
    p.add_argument("--action", required=True,
                   choices=["scholar_profile", "paper_deep_dive", "org_analysis",
                            "venue_papers", "paper_qa", "patent_search",
                            "scholar_patents", "raw"],
                   help="Action to execute")

    # Common parameters
    p.add_argument("--name", help="Scholar name")
    p.add_argument("--title", help="Paper title")
    p.add_argument("--keyword", help="Keyword")
    p.add_argument("--author", help="Author name")
    p.add_argument("--org", help="Organization name")
    p.add_argument("--venue", help="Venue name")
    p.add_argument("--query", help="Query string (natural language Q&A or patent search)")
    p.add_argument("--year", type=int, help="Year filter")
    p.add_argument("--size", type=int, default=10, help="Return count")
    p.add_argument("--page", type=int, default=0, help="Page number")
    p.add_argument("--page_size", type=int, default=100,
                   help="Organization patent page size (max 10000)")
    p.add_argument("--order", default="n_citation",
                   choices=["n_citation", "year"], help="Sort method")

    # Paper QA specific
    p.add_argument("--topic_high", help="Required-match keyword array (JSON string, outer AND inner OR)")
    p.add_argument("--topic_middle", help="High-weight keywords (same format as topic_high)")
    p.add_argument("--sci_flag", action="store_true", help="Return only SCI papers")
    p.add_argument("--sort_citation", action="store_true", help="Sort by citation count")

    # Raw mode
    p.add_argument("--api", help="[raw mode] API function name, e.g. paper_search")
    p.add_argument("--params", help="[raw mode] JSON formatted parameters dict")

    return p


def main():
    parser = build_parser()
    args = parser.parse_args()
    token = args.token

    if args.action == "scholar_profile":
        if not args.name:
            parser.error("--action scholar_profile requires --name parameter")
        result = workflow_scholar_profile(token, args.name)

    elif args.action == "paper_deep_dive":
        if not args.title and not args.keyword:
            parser.error("--action paper_deep_dive requires --title or --keyword parameter")
        result = workflow_paper_deep_dive(
            token, title=args.title, keyword=args.keyword,
            author=args.author, order=args.order
        )

    elif args.action == "org_analysis":
        if not args.org:
            parser.error("--action org_analysis requires --org parameter")
        result = workflow_org_analysis(token, args.org)

    elif args.action == "venue_papers":
        if not args.venue:
            parser.error("--action venue_papers requires --venue parameter")
        result = workflow_venue_papers(token, args.venue, year=args.year, limit=args.size)

    elif args.action == "paper_qa":
        if not args.query and not args.topic_high:
            parser.error("--action paper_qa requires --query or --topic_high parameter")
        result = workflow_paper_qa(
            token, query=args.query,
            topic_high=args.topic_high, topic_middle=args.topic_middle,
            sci_flag=args.sci_flag, sort_citation=args.sort_citation,
            size=args.size
        )

    elif args.action == "patent_search":
        if not args.query:
            parser.error("--action patent_search requires --query parameter")
        result = workflow_patent_search(token, args.query, page=args.page, size=args.size)

    elif args.action == "scholar_patents":
        if not args.name:
            parser.error("--action scholar_patents requires --name parameter")
        result = workflow_scholar_patents(token, args.name)

    elif args.action == "raw":
        if not args.api:
            parser.error("--action raw requires --api parameter (API function name)")
        fn = globals().get(args.api)
        if fn is None or not callable(fn):
            parser.error(f"API function not found: {args.api}. Check source for available functions.")
        kwargs = json.loads(args.params) if args.params else {}
        result = fn(token, **kwargs)

    else:
        parser.print_help()
        sys.exit(1)

    _print(result)


if __name__ == "__main__":
    main()
