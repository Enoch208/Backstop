import asyncio
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from backstop import controller
from backstop.config import settings
from backstop.demo import scripted_diagnoser
from backstop.events import bus
from backstop.runner import execute_demo

app = FastAPI(title="Backstop")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/demo")
async def demo() -> dict:
    demo_id = uuid.uuid4().hex[:8]
    naive_id = f"naive-{demo_id}"
    hardened_id = f"hardened-{demo_id}"
    naive_backend, hardened_backend = controller.make_backends()
    asyncio.create_task(
        execute_demo(
            naive_backend,
            hardened_backend,
            naive_id,
            hardened_id,
            scripted_diagnoser(),
            bus,
            settings.settle_seconds,
        )
    )
    return {"demo_id": demo_id, "naive": naive_id, "hardened": hardened_id}


@app.get("/events/{run_id}")
async def events(run_id: str) -> EventSourceResponse:
    async def stream():
        async for event in bus.subscribe(run_id):
            yield {"event": "run", "data": event.model_dump_json()}

    return EventSourceResponse(stream())


@app.post("/reset")
async def reset() -> dict:
    await asyncio.to_thread(controller.reset_all)
    return {"ok": True}


@app.get("/state")
async def state() -> dict:
    return await asyncio.to_thread(controller.get_state)
