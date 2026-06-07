from backstop.demo import scenario_diagnoser, scripted_diagnoser
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


def test_cascade_scenario_stays_ungrounded_on_reroute():
    backend = MockBackend()
    backend.inject_incident()
    signals = backend.gather()
    diagnoser = scenario_diagnoser("cascade", live=False)

    assert check_quality(diagnoser(signals, None), signals).passed is False
    assert check_quality(diagnoser(signals, "stronger"), signals).passed is False


def test_clean_scenario_is_grounded_from_the_start():
    backend = MockBackend()
    backend.inject_incident()
    signals = backend.gather()
    diagnoser = scenario_diagnoser("clean", live=False)

    assert check_quality(diagnoser(signals, None), signals).passed is True


def test_tool_failure_backend_raises_on_apply():
    from backstop.contracts import ActionType, ProposedAction
    from backstop.controller import with_tool_failure

    backend = with_tool_failure(MockBackend())
    backend.inject_incident()
    assert backend.gather().metrics["checkout.error_rate"] > 0.3
    try:
        backend.apply(ProposedAction(type=ActionType.rollback_deploy, target="f00bad9"))
    except RuntimeError:
        return
    raise AssertionError("expected the tool to fail")
