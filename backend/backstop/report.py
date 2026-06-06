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
