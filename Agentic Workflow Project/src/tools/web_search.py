import asyncio

import httpx
from tavily import TavilyClient

from src.config import settings
from src.tools.citation_tracker import get_store

_client = TavilyClient(api_key=settings.tavily_api_key)


def _sync_search(query: str, max_results: int) -> dict:
    """Blocking Tavily call — run via asyncio.to_thread."""
    try:
        response = _client.search(query=query, max_results=max_results)
        results = []
        store = get_store()
        for r in response.get("results", []):
            store.add(url=r["url"], title=r.get("title", r["url"]))
            results.append({
                "title": r.get("title"),
                "url": r["url"],
                "snippet": r.get("content", "")[:500],
            })
        return {"success": True, "data": {"results": results}, "error": None}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


async def web_search(query: str, max_results: int = 5) -> dict:
    """Async web search. Offloads blocking Tavily I/O to a thread."""
    return await asyncio.to_thread(_sync_search, query, max_results)


async def fetch_page(url: str) -> dict:
    """Async page fetch using httpx.AsyncClient."""
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "ResearchAgent/1.0"})
            resp.raise_for_status()
        text = resp.text[:50_000]
        truncated = len(resp.text) > 50_000
        return {
            "success": True,
            "data": {"content": text, "truncated": truncated, "url": url},
            "error": None,
        }
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


async def parallel_search(queries: list[str], max_results: int = 3) -> dict:
    """Run multiple independent searches concurrently via asyncio.gather."""
    tasks = [web_search(q, max_results) for q in queries]
    outcomes = await asyncio.gather(*tasks, return_exceptions=True)

    all_results = []
    errors = []
    for query, outcome in zip(queries, outcomes):
        if isinstance(outcome, Exception):
            errors.append(f"{query}: {outcome}")
        elif outcome["success"]:
            all_results.extend(outcome["data"]["results"])
        else:
            errors.append(f"{query}: {outcome['error']}")

    return {
        "success": True,
        "data": {
            "results": all_results,
            "errors": errors if errors else None,
        },
        "error": None,
    }
