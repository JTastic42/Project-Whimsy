from pathlib import Path

import anthropic

from src.config import settings
from src.memory.context_store import ContextStore
from src.tools.citation_tracker import get_store

_system_prompt = (Path(__file__).parent.parent.parent / "prompts" / "synthesizer_system.md").read_text()
_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def _classify_format(query: str, hint: str) -> str:
    if hint in ("report", "summary"):
        return hint
    response = await _client.messages.create(
        model=settings.model_classifier,
        max_tokens=10,
        messages=[
            {
                "role": "user",
                "content": (
                    f'Query: "{query}"\n'
                    'Reply with exactly one word: "report" or "summary".'
                ),
            }
        ],
    )
    token = response.content[0].text.strip().lower()
    return "report" if "report" in token else "summary"


async def synthesize(query: str, context: ContextStore, plan: dict) -> str:
    output_format = await _classify_format(query, plan.get("output_format_hint", ""))
    bibliography = get_store().format(style=settings.citation_style)["data"]["bibliography"]
    partial_notice = (
        "\n\n> **Note:** Research was incomplete due to repeated tool errors."
        if context.partial_results
        else ""
    )

    user_message = (
        f"Original query: {query}\n\n"
        f"Output format: {output_format}\n\n"
        f"Findings:\n{context.get_findings_text()}"
        f"{partial_notice}"
    )

    response = await _client.messages.create(
        model=settings.model_synthesizer,
        max_tokens=4096,
        system=_system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    output = response.content[0].text
    if bibliography:
        output += f"\n\n## Sources\n\n{bibliography}"
    return output
