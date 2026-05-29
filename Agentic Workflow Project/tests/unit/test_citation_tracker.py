import pytest
from src.tools.citation_tracker import CitationStore


def test_add_citation():
    store = CitationStore()
    result = store.add(url="https://example.com", title="Example")
    assert result["success"] is True
    assert result["data"]["citation_id"] == 1


def test_deduplication():
    store = CitationStore()
    store.add(url="https://example.com", title="Example")
    result = store.add(url="https://example.com", title="Example")
    assert result["data"]["citation_id"] == 1  # same ID returned


def test_format_numbered():
    store = CitationStore()
    store.add(url="https://a.com", title="Source A")
    store.add(url="https://b.com", title="Source B")
    result = store.format(style="numbered")
    assert result["success"] is True
    bib = result["data"]["bibliography"]
    assert "[1]" in bib
    assert "[2]" in bib


def test_format_empty():
    store = CitationStore()
    result = store.format()
    assert result["data"]["bibliography"] == ""
