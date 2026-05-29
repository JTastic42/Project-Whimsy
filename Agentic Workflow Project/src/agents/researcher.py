import asyncio
import json
from pathlib import Path

import anthropic

from src.config import settings
from src.memory.context_store import ContextStore
from src.tools.citation_tracker import get_store
from src.tools.web_search import web_search, fetch_page, parallel_search
from src.tools.pdf_reader import read_pdf
from src.tools.code_executor import execute_code

_system_prompt = (Path(__file__).parent.parent.parent / "prompts" / "researcher_system.md").read_text()
_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

TOOLS = [
    {
        "name": "parallel_search",
        "description": (
            "Run multiple independent web searches simultaneously. "
            "Prefer this over calling web_search repeatedly when you have "
            "several queries that don't depend on each other's results."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "queries": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of independent search queries (max 5)",
                },
                "max_results": {"type": "integer", "default": 3},
            },
            "required": ["queries"],
        },
    },
    {
        "name": "web_search",
        "description": "Search the web for information on a single topic.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "max_results": {"type": "integer", "default": 5},
            },
            "required": ["query"],
        },
    },
    {
        "name": "fetch_page",
        "description": "Fetch the full content of a web page by URL.",
        "input_schema": {
            "type": "object",
            "properties": {"url": {"type": "string"}},
            "required": ["url"],
        },
    },
    {
        "name": "read_pdf",
        "description": "Extract text from a PDF at a local path or URL.",
        "input_schema": {
            "type": "object",
            "properties": {"path_or_url": {"type": "string"}},
            "required": ["path_or_url"],
        },
    },
    {
        "name": "execute_code",
        "description": "Run Python code to process or analyze data. No file I/O or network.",
        "input_schema": {
            "type": "object",
            "properties": {"code": {"type": "string"}},
            "required": ["code"],
        },
    },
    {
        "name": "add_citation",
        "description": "Register a source in the citation store.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string"},
                "title": {"type": "string"},
                "quote": {"type": "string"},
            },
            "required": ["url", "title"],
        },
    },
]

async def _dispatch(name: str, inp: dict) -> dict:
    """Route a tool call to its async handler."""
    if name == "parallel_search":
        return await parallel_search(**inp)
    if name == "web_search":
        return await web_search(**inp)
    if name == "fetch_page":
        return await fetch_page(**inp)
    if name == "read_pdf":
        return await read_pdf(**inp)
    if name == "execute_code":
        # subprocess-based; offload to thread so it doesn't block the event loop
        return await asyncio.to_thread(execute_code, inp["code"])
    if name == "add_citation":
        return get_store().add(**inp)
    return {"success": False, "data": None, "error": f"Unknown tool: {name}"}


async def run_researcher(plan: dict, context: ContextStore) -> ContextStore:
    messages = [
        {
            "role": "user",
            "content": (
                f"Research plan:\n{json.dumps(plan, indent=2)}\n\n"
                "Execute the plan using the available tools. "
                "Use parallel_search when you have multiple independent queries. "
                "Record all key findings as you go."
            ),
        }
    ]

    consecutive_errors = 0
    for turn in range(settings.max_researcher_turns):
        response = await _client.messages.create(
            model=settings.model_researcher,
            max_tokens=4096,
            system=_system_prompt,
            tools=TOOLS,
            messages=messages,
        )

        for block in response.content:
            if block.type == "text" and block.text.strip():
                context.add_finding(block.text.strip())

        if response.stop_reason == "end_turn":
            break

        if response.stop_reason == "tool_use":
            tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

            # Fan out all tool calls in this turn concurrently
            outcomes = await asyncio.gather(
                *[_dispatch(b.name, b.input) for b in tool_use_blocks],
                return_exceptions=True,
            )

            tool_results = []
            for block, result in zip(tool_use_blocks, outcomes):
                if isinstance(result, Exception):
                    result = {"success": False, "data": None, "error": str(result)}

                if not result.get("success"):
                    consecutive_errors += 1
                else:
                    consecutive_errors = 0

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                })

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

            if consecutive_errors >= 3:
                context.mark_partial()
                break
        else:
            break

    if turn + 1 >= settings.max_researcher_turns:
        context.mark_partial()

    return context
