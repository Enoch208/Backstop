from backstop.demo import scripted_diagnoser
from backstop.events import EventBus
from backstop.infra.mock import MockBackend
from backstop.runner import execute_demo


async def test_execute_demo_diverges_naive_and_hardened():
    naive_backend = MockBackend()
    hardened_backend = MockBackend()
    bus = EventBus()

    await execute_demo(
        naive_backend,
        hardened_backend,
        "naive-1",
        "hardened-1",
        scripted_diagnoser(),
        bus,
        settle_seconds=0,
    )

    naive_events = bus.history("naive-1")
    hardened_events = bus.history("hardened-1")

    assert naive_events[-1].severity == "red"
    assert hardened_events[-1].severity == "green"
    assert any(e.kind.value == "blocked" for e in hardened_events)
