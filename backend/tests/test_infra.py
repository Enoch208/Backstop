import backstop.infra as infra
from backstop.config import settings
from backstop.contracts import ActionType, ProposedAction
from backstop.infra.mock import MockBackend


def test_factory_returns_mock_backend(monkeypatch):
    monkeypatch.setattr(settings, "backend", "mock")
    assert isinstance(infra.get_backend(), MockBackend)


def test_mock_inject_then_rollback_heals():
    backend = MockBackend()
    backend.inject_incident()
    assert backend.gather().metrics["checkout.error_rate"] > 0.3
    bad = backend.gather().recent_deploys[-1]
    backend.apply(ProposedAction(type=ActionType.rollback_deploy, target=bad))
    assert backend.gather().metrics["checkout.error_rate"] < 0.05


def test_mock_unknown_target_raises():
    backend = MockBackend()
    try:
        backend.apply(ProposedAction(type=ActionType.scale_service, target="ghost"))
    except ValueError:
        return
    raise AssertionError("expected ValueError for unknown service")


def test_mock_scale_known_service():
    backend = MockBackend()
    result = backend.apply(
        ProposedAction(type=ActionType.scale_service, target="checkout", replicas=5)
    )
    assert "scaled checkout to 5" == result


def test_mock_rollback_of_healthy_deploy_has_no_effect():
    backend = MockBackend()
    healthy = backend.gather().recent_deploys[0]
    result = backend.apply(
        ProposedAction(type=ActionType.rollback_deploy, target=healthy)
    )
    assert "no effect" in result
