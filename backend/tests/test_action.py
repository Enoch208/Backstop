from backstop.contracts import ActionType, Diagnosis, ProposedAction, Signals
from backstop.guardrails.action import check_action

SIGNALS = Signals(
    services=["checkout"],
    recent_deploys=["a1b2c3"],
    metrics={},
    logs=[],
    protected_resources=["prod-db", "payments"],
)
DIAGNOSIS = Diagnosis(
    hypothesis="x",
    suspected_resource="checkout",
    suspected_deploy_sha="a1b2c3",
    confidence=0.9,
    recommended_action="rollback",
)


def test_scope_all_is_blocked():
    action = ProposedAction(
        type=ActionType.rollback_deploy, target="a1b2c3", scope="all"
    )
    assert check_action(action, DIAGNOSIS, SIGNALS).checks["blast_radius"] is False


def test_protected_resource_is_blocked():
    action = ProposedAction(type=ActionType.scale_service, target="prod-db", replicas=0)
    assert check_action(action, DIAGNOSIS, SIGNALS).checks["protected"] is False


def test_action_must_match_diagnosis():
    action = ProposedAction(type=ActionType.rollback_deploy, target="d4e5f6")
    assert check_action(action, DIAGNOSIS, SIGNALS).checks["matches_diagnosis"] is False


def test_valid_action_passes():
    action = ProposedAction(type=ActionType.rollback_deploy, target="a1b2c3")
    assert check_action(action, DIAGNOSIS, SIGNALS).passed is True
