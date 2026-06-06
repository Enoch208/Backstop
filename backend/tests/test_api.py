from fastapi.testclient import TestClient

from backstop import api, controller
from backstop.infra.mock import MockBackend


def test_demo_endpoint_returns_run_ids(monkeypatch):
    monkeypatch.setattr(api.settings, "settle_seconds", 0)
    monkeypatch.setattr(api.settings, "live", False)
    monkeypatch.setattr(
        controller, "make_backends", lambda: (MockBackend(), MockBackend())
    )

    with TestClient(api.app) as client:
        response = client.post("/demo")

    body = response.json()
    assert response.status_code == 200
    assert body["naive"].startswith("naive-")
    assert body["hardened"].startswith("hardened-")


def test_state_endpoint(monkeypatch):
    monkeypatch.setattr(
        controller,
        "get_state",
        lambda: {"naive": {"checkout": {"ready": 3, "desired": 3}}},
    )
    with TestClient(api.app) as client:
        response = client.get("/state")
    assert response.status_code == 200
    assert response.json()["naive"]["checkout"]["ready"] == 3


def test_reset_endpoint(monkeypatch):
    calls = {"n": 0}

    def fake_reset():
        calls["n"] += 1

    monkeypatch.setattr(controller, "reset_all", fake_reset)
    with TestClient(api.app) as client:
        response = client.post("/reset")
    assert response.status_code == 200
    assert calls["n"] == 1
