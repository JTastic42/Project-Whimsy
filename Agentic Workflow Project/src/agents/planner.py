import json
from pathlib import Path

import anthropic

from src.config import settings

_system_prompt = (Path(__file__).parent.parent.parent / "prompts" / "planner_system.md").read_text()
_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def create_plan(query: str) -> dict:
    """
    Decomposes a research query into a structured plan.
    Returns a dict with keys: subtasks, search_queries, output_format_hint.
    """
    response = await _client.messages.create(
        model=settings.model_planner,
        max_tokens=1024,
        system=_system_prompt,
        messages=[{"role": "user", "content": query}],
    )
    text = response.content[0].text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "subtasks": [query],
            "search_queries": [query],
            "output_format_hint": "summary",
        }
