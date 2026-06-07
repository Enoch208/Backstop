import asyncio
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from backstop import controller
from backstop.config import settings
from backstop.demo import SCENARIOS, scenario_diagnoser
from backstop.events import bus
from backstop.llm import served_model
from backstop.report import build_report
from backstop.runner import execute_demo

app = FastAPI(title="Backstop")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_recent_runs: list[dict] = []


@app.post("/demo")
async def demo(scenario: str = "hallucination") -> dict:
    scenario = scenario if scenario in SCENARIOS else "hallucination"
    demo_id = uuid.uuid4().hex[:8]
    naive_id = f"naive-{demo_id}"
    hardened_id = f"hardened-{demo_id}"
    _recent_runs.insert(
        0, {"demo_id": demo_id, "naive": naive_id, "hardened": hardened_id}
    )
    del _recent_runs[20:]
    naive_backend, hardened_backend = controller.make_backends()
    asyncio.create_task(
        execute_demo(
            naive_backend,
            hardened_backend,
            naive_id,
            hardened_id,
            scenario_diagnoser(scenario, settings.live),
            bus,
            settings.settle_seconds,
        )
    )
    return {
        "demo_id": demo_id,
        "naive": naive_id,
        "hardened": hardened_id,
        "scenario": scenario,
    }


@app.get("/runs")
async def runs() -> dict:
    out = []
    for run in _recent_runs:
        hardened = build_report(bus.history(run["hardened"]))
        naive_events = bus.history(run["naive"])
        naive_done = next(
            (e for e in reversed(naive_events) if e.kind.value == "done"), None
        )
        out.append(
            {
                "demo_id": run["demo_id"],
                "hardened": hardened.model_dump(),
                "naive_outcome": naive_done.label if naive_done else "running",
            }
        )
    return {"runs": out}


@app.get("/events/{run_id}")
async def events(run_id: str) -> EventSourceResponse:
    async def stream():
        async for event in bus.subscribe(run_id):
            yield {"event": "run", "data": event.model_dump_json()}

    return EventSourceResponse(stream())


@app.get("/report/{run_id}")
async def report(run_id: str):
    return build_report(bus.history(run_id))


@app.get("/fallback-test")
async def fallback_test(n: int = 6) -> dict:
    calls = []
    for _ in range(min(max(n, 1), 12)):
        try:
            calls.append(await asyncio.to_thread(served_model))
        except Exception as exc:
            calls.append(f"error: {type(exc).__name__}")
    return {"calls": calls}


@app.post("/reset")
async def reset() -> dict:
    await asyncio.to_thread(controller.reset_all)
    return {"ok": True}


@app.get("/state")
async def state() -> dict:
    return await asyncio.to_thread(controller.get_state)
