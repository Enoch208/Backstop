import pytest

from backstop.config import settings


@pytest.fixture(autouse=True)
def isolate_from_network(monkeypatch):
    monkeypatch.setattr(settings, "prompt_fqn", "")
    monkeypatch.setattr(settings, "mcp_url", "")
    monkeypatch.setattr(settings, "llm_judge", False)
    monkeypatch.setattr(settings, "live", False)
