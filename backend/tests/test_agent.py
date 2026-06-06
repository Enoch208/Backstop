from backstop.agent import plan_action, run_hardened, run_naive
from backstop.contracts import ActionType, Diagnosis, EventKind, Signals
from backstop.events import EventBus
from backstop.infra.mock import MockBackend


def grounded(backend: MockBackend) -> Diagnosis:
    signals = backend.gather()
    return Diagnosis(
        hypothesis="bad deploy raised checkout errors",
        suspected_resource="checkout",
        suspected_deploy_sha=signals.recent_deploys[-1],
        confidence=0.9,
        recommended_action="rollback the bad deploy",
    )


def hallucinated() -> Diagnosis:
    return Diagnosis(
        hypothesis="ghost deploy",
        suspected_resource="checkout",
        suspected_deploy_sha="GHOSTSHA",
        confidence=0.95,
        recommended_action="rollback the bad deploy",
    )


def destructive(backend: MockBackend) -> Diagnosis:
    signals = backend.gather()
    return Diagnosis(
        hypothesis="roll everything back",
        suspected_resource="checkout",
        suspected_deploy_sha=signals.recent_deploys[-1],
        confidence=0.9,
        recommended_action="rollback all deploys everywhere",
    )


def kinds(events) -> list[str]:
    return [event.kind.value for event in events]


async def test_hardened_resolves_grounded_incident():
    backend = MockBackend()
    backend.inject_incident()
    events = await run_hardened(
        "r1", backend, diagnoser=lambda s, m=None: grounded(backend), bus=EventBus()
    )
    assert backend.gather().metrics["checkout.error_rate"] < 0.05
    assert events[-1].kind == EventKind.done
    assert events[-1].severity == "green"


async def test_hardened_catches_hallucination_then_reroutes():
    backend = MockBackend()
    backend.inject_incident()
    calls = {"n": 0}

    def diagnoser(signals, model=None):
        calls["n"] += 1
        return hallucinated() if calls["n"] == 1 else grounded(backend)

    events = await run_hardened("r2", backend, diagnoser=diagnoser, bus=EventBus())
    assert any(e.kind == EventKind.blocked and e.severity == "red" for e in events)
    assert any(e.kind == EventKind.fallback for e in events)
    assert events[-1].severity == "green"
    assert backend.gather().metrics["checkout.error_rate"] < 0.05


async def test_hardened_blocks_destructive_action_and_escalates():
    backend = MockBackend()
    backend.inject_incident()
    events = await run_hardened(
        "r3", backend, diagnoser=lambda s, m=None: destructive(backend), bus=EventBus()
    )
    blocked = [e for e in events if e.kind == EventKind.blocked]
    assert blocked and blocked[0].severity == "red"
    assert events[-1].label == "Escalated to human"
    assert backend.gather().metrics["checkout.error_rate"] > 0.3


async def test_naive_acts_on_hallucination():
    backend = MockBackend()
    backend.inject_incident()
    events = await run_naive(
        "r4", backend, diagnoser=lambda s, m=None: destructive(backend), bus=EventBus()
    )
    assert events[-1].severity == "red"


class FailingBackend(MockBackend):
    def apply(self, action):
        raise RuntimeError("kube API unreachable")


def unknown_target(backend: MockBackend) -> Diagnosis:
    signals = backend.gather()
    return Diagnosis(
        hypothesis="ghost service",
        suspected_resource="ghost",
        suspected_deploy_sha=signals.recent_deploys[-1],
        confidence=0.9,
        recommended_action="restart ghost now",
    )


async def test_hardened_escalates_on_tool_failure():
    backend = FailingBackend()
    backend.inject_incident()
    events = await run_hardened(
        "r5", backend, diagnoser=lambda s, m=None: grounded(backend), bus=EventBus()
    )
    assert any(e.label == "Tool failure" and e.severity == "red" for e in events)
    assert events[-1].label == "Escalated to human"


async def test_hardened_escalates_when_reroute_still_ungrounded():
    backend = MockBackend()
    backend.inject_incident()
    events = await run_hardened(
        "r7", backend, diagnoser=lambda s, m=None: hallucinated(), bus=EventBus()
    )
    assert events[-1].label == "Escalated to human"
    assert events[-1].severity == "amber"
    assert backend.gather().metrics["checkout.error_rate"] > 0.3


async def test_naive_catastrophe_when_action_raises():
    backend = MockBackend()
    backend.inject_incident()
    events = await run_naive(
        "r6", backend, diagnoser=lambda s, m=None: unknown_target(backend), bus=EventBus()
    )
    assert events[-1].label == "Catastrophe"
    assert events[-1].severity == "red"


def test_planner_flags_scope_all():
    diagnosis = destructive(MockBackend())
    assert plan_action(diagnosis).scope == "all"


def test_planner_defaults_to_rollback():
    diagnosis = Diagnosis(
        hypothesis="x",
        suspected_resource="checkout",
        suspected_deploy_sha="abc",
        confidence=0.9,
        recommended_action="rollback the bad deploy",
    )
    action = plan_action(diagnosis)
    assert action.type == ActionType.rollback_deploy
    assert action.scope == "single"
