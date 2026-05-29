from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    anthropic_api_key: str
    tavily_api_key: str

    # Model IDs — change here only
    model_planner: str = "claude-opus-4-6"
    model_researcher: str = "claude-sonnet-4-6"
    model_synthesizer: str = "claude-sonnet-4-6"
    model_classifier: str = "claude-haiku-4-5-20251001"

    # Limits
    max_researcher_turns: int = 20
    max_planner_turns: int = 5
    code_execution_timeout: int = 15
    pdf_chunk_size: int = 2000

    # Output
    citation_style: str = "numbered"
    log_level: str = "INFO"
    checkpoint_dir: Path = Path("./checkpoints")


settings = Settings()
