from backstop.demo import scripted_diagnoser
from backstop.guardrails.quality import check_quality
from backstop.infra.mock import MockBackend


def test_primary_call_is_an_ungrounded_destructive_hallucination():
    backend = MockBackend()
    backend.inject_incident()
    signals = backend.gather()
    diagnosis = scripted_diagnoser()(signals, None)

    assert diagnosis.suspected_resource == "prod-db"
    assert "restart" in diagnosis.recommended_action.lower()
    assert check_quality(diagnosis, signals).passed is False


def test_stronger_model_returns_a_grounded_diagnosis():
    backend = MockBackend()
    backend.inject_incident()
    signals = backend.gather()
    diagnosis = scripted_diagnoser()(signals, "stronger")

    assert diagnosis.suspected_resource == "checkout"
    assert check_quality(diagnosis, signals).passed is True
