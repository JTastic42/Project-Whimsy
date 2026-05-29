import argparse
import asyncio

from src.workflows.research_workflow import run


async def _main(args: argparse.Namespace) -> None:
    if args.max_turns:
        from src import config
        config.settings.max_researcher_turns = args.max_turns
    if args.citation_style:
        from src import config
        config.settings.citation_style = args.citation_style

    result = await run(query=args.query)
    print(result)


def main() -> None:
    parser = argparse.ArgumentParser(description="Research Agent CLI")
    parser.add_argument("--query", required=True, help="Research question")
    parser.add_argument("--output-format", choices=["report", "summary", "auto"], default="auto")
    parser.add_argument("--citation-style", choices=["numbered", "apa", "mla", "chicago"], default="numbered")
    parser.add_argument("--max-turns", type=int, default=None)
    args = parser.parse_args()

    asyncio.run(_main(args))


if __name__ == "__main__":
    main()
