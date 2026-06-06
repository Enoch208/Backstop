import asyncio
from collections import defaultdict
from collections.abc import AsyncIterator

from backstop.contracts import EventKind, RunEvent


class EventBus:
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)
        self._history: dict[str, list[RunEvent]] = defaultdict(list)

    async def publish(self, event: RunEvent) -> None:
        self._history[event.run_id].append(event)
        for queue in list(self._subscribers[event.run_id]):
            await queue.put(event)

    async def subscribe(self, run_id: str) -> AsyncIterator[RunEvent]:
        queue: asyncio.Queue = asyncio.Queue()
        for past in self._history[run_id]:
            await queue.put(past)
        self._subscribers[run_id].append(queue)
        try:
            while True:
                event = await queue.get()
                yield event
                if event.kind == EventKind.done:
                    break
        finally:
            self._subscribers[run_id].remove(queue)

    def history(self, run_id: str) -> list[RunEvent]:
        return list(self._history[run_id])


bus = EventBus()
