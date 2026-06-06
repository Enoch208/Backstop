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


def test_tfy_pii_redacts_request_messages():
    response = client.post(
        "/tfy/pii",
        json={
            "requestBody": {
                "messages": [
                    {"role": "user", "content": "db password=hunter2 token=tfy-abc123def"}
                ]
            }
        },
    )
    body = response.json()
    assert body["verdict"] is True
    assert body["transformed"] is True
    assert "hunter2" not in body["result"]["messages"][0]["content"]


def test_tfy_quality_blocks_invalid_response():
    response = client.post(
        "/tfy/quality",
        json={
            "responseBody": {
                "choices": [{"message": {"content": "not json at all"}}]
            }
        },
    )
    assert response.json()["verdict"] is False


def test_tfy_quality_passes_valid_high_confidence():
    content = (
        '{"hypothesis":"bad deploy","suspected_resource":"checkout",'
        '"suspected_deploy_sha":"a1b2c3","confidence":0.9,'
        '"recommended_action":"rollback"}'
    )
    response = client.post(
        "/tfy/quality",
        json={"responseBody": {"choices": [{"message": {"content": content}}]}},
    )
    assert response.json()["verdict"] is True


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
