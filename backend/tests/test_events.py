import asyncio

from backstop.contracts import EventKind, RunEvent
from backstop.events import EventBus


def event(run_id: str, kind: EventKind = EventKind.step) -> RunEvent:
    return RunEvent(run_id=run_id, agent="hardened", kind=kind, label="x")


async def test_subscriber_receives_published_events():
    bus = EventBus()
    received: list[RunEvent] = []

    async def consume():
        async for evt in bus.subscribe("run"):
            received.append(evt)

    task = asyncio.create_task(consume())
    await asyncio.sleep(0)
    await bus.publish(event("run"))
    await bus.publish(event("run", EventKind.done))
    await asyncio.wait_for(task, timeout=1)

    assert [e.kind for e in received] == [EventKind.step, EventKind.done]


async def test_late_subscriber_replays_history():
    bus = EventBus()
    await bus.publish(event("run"))
    await bus.publish(event("run", EventKind.done))

    received = [evt async for evt in bus.subscribe("run")]
    assert len(received) == 2
    assert received[-1].kind == EventKind.done


async def test_streams_are_isolated_by_run_id():
    bus = EventBus()
    await bus.publish(event("a"))
    await bus.publish(event("a", EventKind.done))
    assert bus.history("b") == []
    assert len(bus.history("a")) == 2
