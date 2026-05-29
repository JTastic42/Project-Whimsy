import asyncio
import io
from pathlib import Path

import httpx

from src.tools.citation_tracker import get_store


def _sync_read_pdf(path_or_url: str) -> dict:
    """Blocking PDF extraction — run via asyncio.to_thread."""
    try:
        import fitz  # pymupdf
    except ImportError:
        return {"success": False, "data": None, "error": "pymupdf not installed. Run: uv add pymupdf"}

    try:
        if path_or_url.startswith("http"):
            with httpx.Client(timeout=30, follow_redirects=True) as client:
                resp = client.get(path_or_url)
                resp.raise_for_status()
            pdf_bytes = resp.content
            source = path_or_url
        else:
            pdf_bytes = Path(path_or_url).read_bytes()
            source = path_or_url

        doc = fitz.open(stream=io.BytesIO(pdf_bytes), filetype="pdf")
        chunks = []
        chunk_chars = 2000 * 4  # ~4 chars per token
        for page_num, page in enumerate(doc, start=1):
            text = page.get_text()
            for i in range(0, len(text), chunk_chars):
                chunks.append({
                    "page": page_num,
                    "text": text[i : i + chunk_chars],
                    "source": source,
                })

        get_store().add(url=source, title=Path(source).name)
        return {"success": True, "data": {"chunks": chunks, "total_pages": len(doc)}, "error": None}
    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


async def read_pdf(path_or_url: str) -> dict:
    """Async PDF reader. Offloads blocking I/O and parsing to a thread."""
    return await asyncio.to_thread(_sync_read_pdf, path_or_url)
