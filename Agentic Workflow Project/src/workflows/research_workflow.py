from src.agents.planner import create_plan
from src.agents.researcher import run_researcher
from src.agents.synthesizer import synthesize
from src.memory.context_store import ContextStore
from src.tools.citation_tracker import reset_store


async def run(query: str) -> str:
    """Top-level research workflow. Returns the final synthesized output."""
    reset_store()
    context = ContextStore()

    plan = await create_plan(query)
    context = await run_researcher(plan, context)
    return await synthesize(query, context, plan)
