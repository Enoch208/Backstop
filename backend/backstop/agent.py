import asyncio
from collections.abc import Callable

from backstop.breaker import CircuitBreaker
from backstop.contracts import (
    ActionType,
    Diagnosis,
    EventKind,
    ProposedAction,
    RunEvent,
    Signals,
)
from backstop.events import EventBus
from backstop.events import bus as default_bus
from backstop.guardrails.action import check_action
from backstop.guardrails.quality import check_quality
from backstop.infra.base import InfraBackend
from backstop.llm import diagnose as llm_diagnose

Diagnoser = Callable[[Signals, str | None], Diagnosis]


def plan_action(diagnosis: Diagnosis) -> ProposedAction:
    text = diagnosis.recommended_action.lower()
    scope = "all" if "all" in text or "everything" in text else "single"
    if "scale" in text or "restart" in text or "down" in text:
        replicas = 0 if "restart" in text or "down" in text or "zero" in text else 3
        return ProposedAction(
            type=ActionType.scale_service,
            target=diagnosis.suspected_resource,
            scope=scope,
            replicas=replicas,
        )
    return ProposedAction(
        type=ActionType.rollback_deploy,
        target=diagnosis.suspected_deploy_sha,
        scope=scope,
    )


class _Emitter:
    def __init__(self, bus: EventBus, run_id: str, agent: str):
        self.bus = bus
        self.run_id = run_id
        self.agent = agent
        self.events: list[RunEvent] = []

    async def emit(
        self,
        kind: EventKind,
        label: str,
        detail: str = "",
        severity: str = "info",
        data: dict | None = None,
    ) -> RunEvent:
        event = RunEvent(
            run_id=self.run_id,
            agent=self.agent,
            kind=kind,
            label=label,
            detail=detail,
            severity=severity,
            data=data or {},
        )
        self.events.append(event)
        await self.bus.publish(event)
        return event


async def run_hardened(
    run_id: str,
    backend: InfraBackend,
    diagnoser: Diagnoser | None = None,
    bus: EventBus | None = None,
) -> list[RunEvent]:
    diagnoser = diagnoser or llm_diagnose
    out = _Emitter(bus or default_bus, run_id, "hardened")
    breaker = CircuitBreaker(budget=3)

    await out.emit(EventKind.step, "Incident triggered", "Alert received; opening triage run")

    signals = await asyncio.to_thread(backend.gather)
    await out.emit(
        EventKind.step,
        "Gathered signals",
        f"error_rate={signals.metrics.get('checkout.error_rate')}",
        data={"metrics": signals.metrics, "feature": "Scoped MCP (read-only)"},
    )

    diagnosis = await asyncio.to_thread(diagnoser, signals, None)
    await out.emit(EventKind.step, "Diagnosis", diagnosis.hypothesis, data=diagnosis.model_dump())

    quality = check_quality(diagnosis, signals)
    await out.emit(
        EventKind.gate,
        "Quality gate",
        "groundedness + confidence",
        severity="green" if quality.passed else "red",
        data={"checks": quality.checks, "feature": "Custom Guardrail"},
    )

    if not quality.passed:
        breaker.record_anomaly()
        await out.emit(
            EventKind.blocked,
            "Hallucinated diagnosis caught",
            ", ".join(quality.reasons),
            severity="red",
            data={"feature": "Custom Guardrail"},
        )
        await out.emit(
            EventKind.fallback,
            "Re-routing to a stronger model",
            "ungrounded output rejected",
            severity="amber",
            data={"feature": "AI Gateway"},
        )
        diagnosis = await asyncio.to_thread(diagnoser, signals, "stronger")
        await out.emit(EventKind.step, "Re-diagnosis", diagnosis.hypothesis, data=diagnosis.model_dump())
        quality = check_quality(diagnosis, signals)
        await out.emit(
            EventKind.gate,
            "Quality gate (retry)",
            "groundedness + confidence",
            severity="green" if quality.passed else "red",
            data={"checks": quality.checks, "feature": "Custom Guardrail"},
        )
        if not quality.passed:
            await out.emit(
                EventKind.done,
                "Escalated to human",
                "still ungrounded after re-route; degrading safely",
                severity="amber",
            )
            return out.events

    action = plan_action(diagnosis)
    await out.emit(
        EventKind.step,
        "Planned remediation",
        f"{action.type.value} {action.target} scope={action.scope}",
        data=action.model_dump(),
    )

    verdict = check_action(action, diagnosis, signals)
    await out.emit(
        EventKind.gate,
        "Action-validation gate",
        "blast radius + protected resources + matches evidence",
        severity="green" if verdict.passed else "red",
        data={"checks": verdict.checks, "feature": "Custom Guardrail"},
    )

    if not verdict.passed:
        breaker.record_anomaly()
        await out.emit(
            EventKind.blocked,
            "Destructive action blocked",
            ", ".join(verdict.reasons),
            severity="red",
            data={"feature": "Custom Guardrail", "blocked_action": action.model_dump()},
        )
        await out.emit(
            EventKind.done,
            "Escalated to human",
            "no safe action; handing off with full context",
            severity="amber",
        )
        return out.events

    try:
        result = await asyncio.to_thread(backend.apply, action)
    except Exception as exc:
        breaker.record_anomaly()
        await out.emit(EventKind.blocked, "Tool failure", str(exc), severity="red")
        await out.emit(
            EventKind.done,
            "Escalated to human",
            "execution failed; degrading safely",
            severity="amber",
        )
        return out.events

    await out.emit(
        EventKind.action,
        "Executed remediation",
        result,
        severity="green",
        data={"feature": "Scoped MCP (narrow-write)"},
    )

    healed = await asyncio.to_thread(backend.gather)
    await out.emit(
        EventKind.done,
        "Incident resolved",
        f"error_rate={healed.metrics.get('checkout.error_rate')}",
        severity="green",
        data={"metrics": healed.metrics},
    )
    return out.events


async def run_naive(
    run_id: str,
    backend: InfraBackend,
    diagnoser: Diagnoser | None = None,
    bus: EventBus | None = None,
) -> list[RunEvent]:
    diagnoser = diagnoser or llm_diagnose
    out = _Emitter(bus or default_bus, run_id, "naive")

    await out.emit(EventKind.step, "Incident triggered", "Alert received")

    signals = await asyncio.to_thread(backend.gather)
    await out.emit(
        EventKind.step,
        "Gathered signals",
        f"error_rate={signals.metrics.get('checkout.error_rate')}",
        data={"metrics": signals.metrics},
    )

    diagnosis = await asyncio.to_thread(diagnoser, signals, None)
    await out.emit(EventKind.step, "Diagnosis", diagnosis.hypothesis, data=diagnosis.model_dump())

    action = plan_action(diagnosis)
    destructive = action.scope == "all" or action.target in signals.protected_resources
    await out.emit(
        EventKind.action,
        "Acting on the diagnosis immediately",
        f"{action.type.value} {action.target} scope={action.scope}",
        severity="red" if destructive else "amber",
        data=action.model_dump(),
    )

    try:
        result = await asyncio.to_thread(backend.apply, action)
    except Exception as exc:
        await out.emit(
            EventKind.done,
            "Catastrophe",
            f"acted on a bad output: {exc}",
            severity="red",
        )
        return out.events

    await out.emit(
        EventKind.done,
        "Catastrophe" if destructive else "Action executed",
        result,
        severity="red" if destructive else "info",
        data={"applied": action.model_dump()},
    )
    return out.events
