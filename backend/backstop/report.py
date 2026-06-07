import hashlib
import json

from pydantic import BaseModel

from backstop.contracts import EventKind, RunEvent


class IncidentReport(BaseModel):
    run_id: str
    outcome: str
    root_cause: str
    actions_taken: list[str]
    caught: list[str]
    failures_handled: int
    summary: str


def build_report(events: list[RunEvent]) -> IncidentReport:
    run_id = events[0].run_id if events else ""
    done = next(
        (event for event in reversed(events) if event.kind == EventKind.done), None
    )
    if done is None:
        outcome = "running"
    elif done.severity == "green":
        outcome = "resolved"
    else:
        outcome = "escalated"

    diagnoses = [e for e in events if e.label in ("Diagnosis", "Re-diagnosis")]
    root_cause = diagnoses[-1].detail if diagnoses else "undetermined"

    actions_taken = [
        e.detail
        for e in events
        if e.kind == EventKind.action and e.severity == "green"
    ]
    caught = [f"{e.label} — {e.detail}" for e in events if e.kind == EventKind.blocked]
    failures_handled = sum(
        1
        for e in events
        if e.kind in (EventKind.blocked, EventKind.fallback)
    )

    summary = (
        f"Backstop {outcome} the incident. "
        f"{len(caught)} bad output(s) caught, "
        f"{len(actions_taken)} safe action(s) executed."
    )

    return IncidentReport(
        run_id=run_id,
        outcome=outcome,
        root_cause=root_cause,
        actions_taken=actions_taken,
        caught=caught,
        failures_handled=failures_handled,
        summary=summary,
    )


class IncidentReceipt(BaseModel):
    run_id: str
    scenario: str
    outcome: str
    summary: str
    root_cause: str
    features_engaged: list[str]
    guardrail_decisions: list[dict]
    actions_blocked: list[str]
    actions_executed: list[str]
    fallbacks: int
    timeline: list[dict]
    integrity_sha256: str
    issued_at: str


def build_receipt(
    events: list[RunEvent], scenario: str = "", issued_at: str = ""
) -> IncidentReceipt:
    report = build_report(events)
    timeline = [
        {
            "kind": event.kind.value,
            "label": event.label,
            "detail": event.detail,
            "severity": event.severity,
            "feature": event.data.get("feature", ""),
        }
        for event in events
    ]
    features_engaged = sorted(
        {event.data.get("feature") for event in events if event.data.get("feature")}
    )
    guardrail_decisions = [
        {"check": event.label, "detail": event.detail, "passed": event.severity != "red"}
        for event in events
        if event.kind == EventKind.gate
    ]
    fallbacks = sum(1 for event in events if event.kind == EventKind.fallback)
    canonical = json.dumps(
        {"run_id": report.run_id, "timeline": timeline},
        sort_keys=True,
        separators=(",", ":"),
    )
    integrity = hashlib.sha256(canonical.encode()).hexdigest()
    return IncidentReceipt(
        run_id=report.run_id,
        scenario=scenario,
        outcome=report.outcome,
        summary=report.summary,
        root_cause=report.root_cause,
        features_engaged=features_engaged,
        guardrail_decisions=guardrail_decisions,
        actions_blocked=report.caught,
        actions_executed=report.actions_taken,
        fallbacks=fallbacks,
        timeline=timeline,
        integrity_sha256=integrity,
        issued_at=issued_at,
    )
