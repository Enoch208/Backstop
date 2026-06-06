from fastapi import FastAPI
from pydantic import BaseModel

from backstop.contracts import Diagnosis, ProposedAction, Signals, Verdict
from backstop.guardrails.action import check_action
from backstop.guardrails.quality import check_quality

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
