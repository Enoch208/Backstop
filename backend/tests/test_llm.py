from types import SimpleNamespace

from backstop import llm
from backstop.contracts import Signals

SIGNALS = Signals(
    services=["checkout"],
    recent_deploys=["a1b2c3"],
    metrics={"checkout.error_rate": 0.4},
    logs=[],
    protected_resources=["prod-db"],
)


def fake_client(content: str):
    def create(**kwargs):
        message = SimpleNamespace(content=content)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])

    completions = SimpleNamespace(create=create)
    return SimpleNamespace(chat=SimpleNamespace(completions=completions))


def test_client_is_configured_from_settings(monkeypatch):
    monkeypatch.setattr(llm.settings, "api_key", "test-key")
    monkeypatch.setattr(llm.settings, "base_url", "https://gw.example/api/llm")
    client = llm._client()
    assert str(client.base_url).startswith("https://gw.example")


def test_diagnose_parses_structured_json(monkeypatch):
    payload = (
        '{"hypothesis":"bad deploy","suspected_resource":"checkout",'
        '"suspected_deploy_sha":"a1b2c3","confidence":0.9,'
        '"recommended_action":"rollback the bad deploy"}'
    )
    monkeypatch.setattr(llm, "_client", lambda: fake_client(payload))
    diagnosis = llm.diagnose(SIGNALS)

    assert diagnosis.suspected_resource == "checkout"
    assert diagnosis.confidence == 0.9


def test_diagnose_strips_markdown_fences(monkeypatch):
    payload = (
        '```json\n{"hypothesis":"bad deploy","suspected_resource":"checkout",'
        '"suspected_deploy_sha":"a1b2c3","confidence":0.7,'
        '"recommended_action":"rollback"}\n```'
    )
    monkeypatch.setattr(llm, "_client", lambda: fake_client(payload))
    diagnosis = llm.diagnose(SIGNALS)

    assert diagnosis.suspected_resource == "checkout"
    assert diagnosis.confidence == 0.7
