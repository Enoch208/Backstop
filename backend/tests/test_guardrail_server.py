from fastapi.testclient import TestClient

from backstop.guardrails.server import app

client = TestClient(app)

SIGNALS = {
    "services": ["checkout"],
    "recent_deploys": ["a1b2c3"],
    "metrics": {"checkout.error_rate": 0.4},
    "logs": [],
    "protected_resources": ["prod-db"],
}


def test_quality_endpoint_flags_hallucination():
    response = client.post(
        "/guardrails/quality",
        json={
            "diagnosis": {
                "hypothesis": "x",
                "suspected_resource": "checkout",
                "suspected_deploy_sha": "GHOST",
                "confidence": 0.9,
                "recommended_action": "rollback",
            },
            "signals": SIGNALS,
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["passed"] is False
    assert body["checks"]["grounded_sha"] is False


def test_action_endpoint_blocks_scope_all():
    response = client.post(
        "/guardrails/action",
        json={
            "action": {
                "type": "rollback_deploy",
                "target": "a1b2c3",
                "scope": "all",
            },
            "diagnosis": {
                "hypothesis": "x",
                "suspected_resource": "checkout",
                "suspected_deploy_sha": "a1b2c3",
                "confidence": 0.9,
                "recommended_action": "rollback",
            },
            "signals": SIGNALS,
        },
    )
    assert response.json()["checks"]["blast_radius"] is False
