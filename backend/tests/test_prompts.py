from backstop import prompts
from backstop.config import settings


def test_returns_none_when_no_prompt_configured(monkeypatch):
    monkeypatch.setattr(settings, "prompt_fqn", "")
    assert prompts.fetch_messages("{}") is None


def test_returns_none_on_fetch_failure(monkeypatch):
    monkeypatch.setattr(settings, "prompt_fqn", "chat_prompt:truefoundry/default/x:1")
    monkeypatch.setattr(
        prompts, "_template", lambda: (_ for _ in ()).throw(RuntimeError("boom"))
    )
    assert prompts.fetch_messages("{}") is None
