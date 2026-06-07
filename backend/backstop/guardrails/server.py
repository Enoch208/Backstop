import json

from fastapi import FastAPI
from pydantic import BaseModel

from backstop.contracts import Diagnosis, ProposedAction, Signals, Verdict
from backstop.guardrails.action import check_action
from backstop.guardrails.pii import redact_text
from backstop.guardrails.quality import MIN_CONFIDENCE, check_quality
from backstop.llm import _extract_json

DIAGNOSIS_FIELDS = {
    "hypothesis",
    "suspected_resource",
    "suspected_deploy_sha",
    "confidence",
    "recommended_action",
}

app = FastAPI(title="Backstop Guardrails")


class QualityRequest(BaseModel):
    diagnosis: Diagnosis
    signals: Signals


class ActionRequest(BaseModel):
    action: ProposedAction
    diagnosis: Diagnosis
    signals: Signals


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/guardrails/quality", response_model=Verdict)
def quality(request: QualityRequest) -> Verdict:
    return check_quality(request.diagnosis, request.signals)


@app.post("/guardrails/action", response_model=Verdict)
def action(request: ActionRequest) -> Verdict:
    return check_action(request.action, request.diagnosis, request.signals)


@app.post("/tfy/pii")
def tfy_pii(payload: dict) -> dict:
    request_body = payload.get("requestBody", {})
    messages = request_body.get("messages", [])
    transformed = False
    for message in messages:
        content = message.get("content")
        if isinstance(content, str):
            redacted = redact_text(content)
            if redacted != content:
                message["content"] = redacted
                transformed = True
    if transformed:
        return {"verdict": True, "transformed": True, "result": request_body}
    return {"verdict": True, "message": "no secrets detected"}


@app.post("/tfy/quality")
def tfy_quality(payload: dict) -> dict:
    response_body = payload.get("responseBody", {})
    choices = response_body.get("choices", [])
    if not choices:
        return {"verdict": True, "message": "no content to validate"}

    content = choices[0].get("message", {}).get("content", "") or ""
    try:
        diagnosis = json.loads(_extract_json(content))
    except (ValueError, TypeError):
        return {"verdict": True, "message": "not a structured diagnosis; skipped"}

    if not DIAGNOSIS_FIELDS.issubset(diagnosis):
        return {"verdict": True, "message": "not a structured diagnosis; skipped"}

    confidence = diagnosis.get("confidence")
    if not isinstance(confidence, (int, float)) or confidence < MIN_CONFIDENCE:
        return {"verdict": False, "message": f"confidence {confidence} below threshold"}

    return {"verdict": True, "message": "schema and confidence valid"}
