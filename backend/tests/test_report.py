from backstop.agent import run_hardened, run_naive
from backstop.demo import scripted_diagnoser
from backstop.events import EventBus
from backstop.infra.mock import MockBackend
from backstop.report import build_report


async def test_report_for_resolved_run_after_catch():
    backend = MockBackend()
    backend.inject_incident()
    bus = EventBus()
    await run_hardened("r", backend, diagnoser=scripted_diagnoser(), bus=bus)

    report = build_report(bus.history("r"))

    assert report.run_id == "r"
    assert report.outcome == "resolved"
    assert len(report.caught) >= 1
    assert len(report.actions_taken) == 1
    assert report.failures_handled >= 2
    assert "checkout" in report.root_cause.lower()


async def test_report_for_naive_catastrophe():
    backend = MockBackend()
    backend.inject_incident()
    bus = EventBus()
    await run_naive("n", backend, diagnoser=scripted_diagnoser(), bus=bus)

    report = build_report(bus.history("n"))
    assert report.outcome != "resolved"
    assert report.actions_taken == []


def test_report_for_empty_history():
    report = build_report([])
    assert report.outcome == "running"
    assert report.root_cause == "undetermined"
