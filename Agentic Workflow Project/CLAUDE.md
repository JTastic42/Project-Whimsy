# Research Agent

## Project Overview
An agentic research assistant that autonomously plans, searches, reads documents,
executes analysis code, tracks citations, and synthesizes findings into structured
reports or concise summaries — choosing output format based on the query.

The system uses a three-agent pipeline:
1. **Planner** — decomposes the research question into subtasks and a search plan
2. **Researcher** — executes searches, reads sources, runs analysis, tracks citations
3. **Synthesizer** — merges findings into a formatted output with citations

## Stack
- **Runtime**: Python 3.11+ via `uv`
- **AI SDK**: `anthropic` (latest) — all agents use `AsyncAnthropic`
- **Concurrency**: `asyncio` — all I/O is async; blocking calls run via `asyncio.to_thread`
- **Web search**: `tavily-python` (primary), `httpx.AsyncClient` for raw fetches
- **PDF parsing**: `pymupdf` (fitz) — offloaded to thread pool
- **Code execution**: `subprocess` sandbox with timeout — offloaded to thread pool
- **Citation management**: custom `CitationStore` (see `src/tools/citation_tracker.py`)
- **Testing**: `pytest` + `pytest-asyncio`
- **Linting**: `ruff`

## Project Structure
```
src/
  agents/
    planner.py            # Breaks research question into subtask plan
    researcher.py         # Executes plan: search, read, analyze
    synthesizer.py        # Merges findings, formats output
  tools/
    web_search.py         # Tavily search + page fetch
    pdf_reader.py         # PDF ingestion and chunking
    code_executor.py      # Sandboxed Python execution
    citation_tracker.py   # Source registry and citation formatting
  workflows/
    research_workflow.py  # Top-level orchestration
  memory/
    context_store.py      # In-session context and scratchpad
  config.py               # Settings via pydantic-settings
  main.py                 # CLI entry point
prompts/
  planner_system.md
  researcher_system.md
  synthesizer_system.md
tests/
  unit/
  integration/
.env.example
pyproject.toml
CLAUDE.md
```

## Agent Roles & Model Assignment

| Agent       | Model                        | Reason                                      |
|-------------|------------------------------|---------------------------------------------|
| Planner     | `claude-opus-4-6`            | Complex query decomposition and reasoning   |
| Researcher  | `claude-sonnet-4-6`          | Balanced capability for iterative tool use  |
| Synthesizer | `claude-sonnet-4-6`          | High-quality writing and structure          |
| Classifier  | `claude-haiku-4-5-20251001`  | Fast output-format decision (report vs summary) |

Model IDs are defined as constants in `src/config.py` — never hardcode them elsewhere.

## Tool Contracts

Every tool function must return a dict matching this shape:
```python
{
    "success": bool,
    "data": ...,       # tool-specific payload on success
    "error": str | None  # human-readable error message on failure
}
```

### Tool Definitions

All tools are `async`. Blocking work is offloaded with `asyncio.to_thread`.

**`parallel_search(queries, max_results=3)`** ← prefer this for multi-query turns
- Fans out N searches concurrently via `asyncio.gather`
- Aggregates and deduplicates results across all queries
- Returns `{results: [...], errors: [...] | None}`

**`web_search(query, max_results=5)`**
- Single async Tavily search (sync client via `asyncio.to_thread`)
- Returns list of `{title, url, snippet}` objects
- Registers each result in `CitationStore`

**`fetch_page(url)`**
- Async fetch via `httpx.AsyncClient`
- Max 50,000 chars; truncated with notice
- Returns `{content, truncated, url}`

**`read_pdf(path_or_url)`**
- Async; extraction runs in thread pool via `asyncio.to_thread`
- Chunks into 2,000-token segments
- Returns list of `{page, text, source}` chunks

**`execute_code(code, timeout=15)`**
- Runs Python in a subprocess sandbox (no file I/O, no network)
- Dispatched via `asyncio.to_thread` to avoid blocking the event loop
- Returns `{stdout, stderr, exit_code}`

**`add_citation(url, title, quote=None)`**
- Synchronous (pure in-memory); safe to call without await
- Returns assigned citation ID (e.g., `[1]`)

## Workflow Execution

```
User Query
    │
    ▼
[Planner] ──────────────────────────────────────────────────────┐
  • Classifies query complexity (simple / multi-step)           │
  • Produces JSON research plan: {subtasks, search_queries,     │
    expected_sources, output_format_hint}                       │
    └──────────────────────────────────────────────────────────▼
                                                         [Researcher]
                                                           (tool loop)
                                                           • parallel_search ← preferred
                                                           • web_search
                                                           • fetch_page
                                                           • read_pdf
                                                           • execute_code
                                                           • add_citation
                                                           • writes findings
                                                             to context store
                                                               │
                                                               ▼
                                                        [Synthesizer]
                                                          • reads findings
                                                          • decides format
                                                          • writes output
                                                          • appends citations
```

The Researcher runs in a tool-use loop capped at `MAX_RESEARCHER_TURNS` (default: 20).
If the cap is hit, it signals the Synthesizer with whatever findings exist.

## Output Format Logic

The Synthesizer uses a fast classifier call to choose output format:

- **Structured report** — multi-part question, academic/professional context,
  query mentions "report", "analysis", "overview"
- **Bullet summary** — simple factual question, quick lookup, time-sensitive

Output always ends with a `## Sources` section (citation list).

## Configuration (`src/config.py`)

```python
class Settings(BaseSettings):
    anthropic_api_key: str
    tavily_api_key: str
    max_researcher_turns: int = 20
    max_planner_turns: int = 5
    code_execution_timeout: int = 15      # seconds
    pdf_chunk_size: int = 2000            # tokens
    citation_style: str = "numbered"
    log_level: str = "INFO"
    checkpoint_dir: Path = Path("./checkpoints")
```

All values come from environment variables (see `.env.example`).

## Running the Agent

```bash
# Install
uv sync

# Run
uv run python -m src.main --query "What are the latest advances in protein folding?"

# Optional flags
--output-format report     # Force report format
--output-format summary    # Force summary format
--citation-style apa       # Override citation style
--max-turns 30             # Override researcher turn limit

# Tests
uv run pytest tests/ -v

# Lint
uv run ruff check src/
```

## Development Conventions

### Async Rules
- Every tool function signature must be `async def` — no sync tool functions
- Blocking I/O (sync SDKs, file reads, CPU-heavy work) must use `asyncio.to_thread`
- Never use `time.sleep` — use `asyncio.sleep` if a delay is needed
- All agent functions (`create_plan`, `run_researcher`, `synthesize`) are `async def`
- The event loop is owned by `asyncio.run()` in `main.py` — do not create nested loops
- Use `asyncio.gather(*tasks, return_exceptions=True)` when fanning out; always handle
  `Exception` instances in the results list

### Adding a New Tool
1. Create `src/tools/<tool_name>.py` with an `async def` function matching the tool contract
2. If the implementation is blocking, wrap it: `return await asyncio.to_thread(_sync_fn, ...)`
3. Add the tool schema to `src/agents/researcher.py` `TOOLS` list
4. Add a dispatch branch in `_dispatch()` in `researcher.py`
5. Write a unit test in `tests/unit/test_<tool_name>.py`

### Modifying Agent Behavior
- Edit the system prompt in `prompts/<agent>_system.md`
- Do not put behavior instructions in Python strings — keep them in the prompt files
- After editing a prompt, run the relevant integration test to verify behavior

### Context Management
- The Researcher receives a rolling summary of findings, not the full history
- Summaries are generated every 5 turns by calling the Synthesizer in summary-only mode
- Full turn history is stored in `context_store` for debugging but not passed to the model

## Safety Guardrails
- Hard turn cap on all agent loops (`MAX_RESEARCHER_TURNS`)
- Code execution is sandboxed: no file writes, no network, 15s timeout
- No tool output is passed back to the model unsanitized — strip control characters
- Citations are deduplicated by URL before rendering
- If web_search or fetch_page fails 3 times consecutively, the Researcher stops and
  signals the Synthesizer with a partial-results flag

## Anti-patterns
- Do not let the Researcher call the Planner — the graph is one-directional
- Do not accumulate raw page content in context — summarize and discard
- Do not use `Any` in tool schemas — be explicit with types
- Do not silently swallow tool errors — always propagate to orchestrator
- Do not store API keys in checkpoints or context store
- Do not call `asyncio.run()` inside an async function — it will raise `RuntimeError`
- Do not use sync `httpx.Client` in async tool functions — use `httpx.AsyncClient`
- Do not call blocking SDK methods directly in `async def` — use `asyncio.to_thread`
- Do not use `gather` without `return_exceptions=True` — an uncaught exception cancels all tasks
