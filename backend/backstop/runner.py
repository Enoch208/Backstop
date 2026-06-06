import asyncio
from collections.abc import Callable

from backstop.agent import Diagnoser, run_hardened, run_naive
from backstop.contracts import Diagnosis, Signals
from backstop.events import EventBus
from backstop.infra.base import InfraBackend


async def execute_demo(
    naive_backend: InfraBackend,
    hardened_backend: InfraBackend,
    naive_id: str,
    hardened_id: str,
    diagnoser: Diagnoser,
    bus: EventBus,
    settle_seconds: int = 0,
) -> None:
    await asyncio.to_thread(naive_backend.inject_incident)
    await asyncio.to_thread(hardened_backend.inject_incident)
    if settle_seconds:
        await asyncio.sleep(settle_seconds)
    await asyncio.gather(
        run_naive(naive_id, naive_backend, diagnoser=diagnoser, bus=bus),
        run_hardened(hardened_id, hardened_backend, diagnoser=diagnoser, bus=bus),
    )
