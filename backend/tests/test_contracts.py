import pytest
from pydantic import ValidationError

from backstop.contracts import ActionType, Diagnosis, ProposedAction


def test_diagnosis_confidence_must_be_within_bounds():
    with pytest.raises(ValidationError):
        Diagnosis(
            hypothesis="x",
            suspected_resource="checkout",
            suspected_deploy_sha="abc",
            confidence=1.5,
            recommended_action="rollback",
        )


def test_proposed_action_defaults_to_single_scope():
    action = ProposedAction(type=ActionType.rollback_deploy, target="abc123")
    assert action.scope == "single"
