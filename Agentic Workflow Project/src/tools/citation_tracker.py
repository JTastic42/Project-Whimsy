from dataclasses import dataclass, field
from datetime import date


@dataclass
class Citation:
    id: int
    url: str
    title: str
    accessed: date
    quote: str | None = None


class CitationStore:
    def __init__(self):
        self._store: dict[str, Citation] = {}
        self._counter = 0

    def add(self, url: str, title: str, quote: str | None = None) -> dict:
        if url in self._store:
            return {"success": True, "data": {"citation_id": self._store[url].id}}
        self._counter += 1
        self._store[url] = Citation(
            id=self._counter,
            url=url,
            title=title,
            accessed=date.today(),
            quote=quote,
        )
        return {"success": True, "data": {"citation_id": self._counter}, "error": None}

    def format(self, style: str = "numbered") -> dict:
        if not self._store:
            return {"success": True, "data": {"bibliography": ""}, "error": None}
        citations = sorted(self._store.values(), key=lambda c: c.id)
        lines = []
        for c in citations:
            if style == "numbered":
                lines.append(f"[{c.id}] {c.title}. {c.url} (accessed {c.accessed})")
            elif style == "apa":
                lines.append(f"{c.title}. Retrieved {c.accessed}, from {c.url}")
            else:
                lines.append(f"{c.title}. {c.url}")
        return {"success": True, "data": {"bibliography": "\n".join(lines)}, "error": None}


# Session-scoped singleton
_store = CitationStore()


def get_store() -> CitationStore:
    return _store


def reset_store() -> None:
    global _store
    _store = CitationStore()
