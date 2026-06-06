from enum import Enum

from pydantic import BaseModel, Field


class Signals(BaseModel):
    services: list[str]
    recent_deploys: list[str]
    metrics: dict[str, float]
    logs: list[str]
    protected_resources: list[str]


class Diagnosis(BaseModel):
    hypothesis: str
    suspected_resource: str
    suspected_deploy_sha: str
    confidence: float = Field(ge=0, le=1)
    recommended_action: str


class ActionType(str, Enum):
    scale_service = "scale_service"
    rollback_deploy = "rollback_deploy"


class ProposedAction(BaseModel):
    type: ActionType
    target: str
    scope: str = "single"
    replicas: int | None = None


class Verdict(BaseModel):
    passed: bool
    checks: dict[str, bool]
    reasons: list[str]


class EventKind(str, Enum):
    step = "step"
    gate = "gate"
    fallback = "fallback"
    action = "action"
    blocked = "blocked"
    breaker = "breaker"
    done = "done"


class RunEvent(BaseModel):
    run_id: str
    agent: str
    kind: EventKind
    label: str
    detail: str = ""
    severity: str = "info"
    data: dict = Field(default_factory=dict)
