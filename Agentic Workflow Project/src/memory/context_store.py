from dataclasses import dataclass, field


@dataclass
class ContextStore:
    """In-session scratchpad for findings. Keeps a rolling summary + raw turn log."""
    findings: list[str] = field(default_factory=list)
    turn_log: list[dict] = field(default_factory=list)
    partial_results: bool = False

    def add_finding(self, text: str) -> None:
        self.findings.append(text)

    def add_turn(self, role: str, content: str) -> None:
        self.turn_log.append({"role": role, "content": content})

    def get_findings_text(self) -> str:
        return "\n\n---\n\n".join(self.findings)

    def mark_partial(self) -> None:
        self.partial_results = True
