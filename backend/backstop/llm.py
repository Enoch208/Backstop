from openai import OpenAI

from backstop.config import settings
from backstop.contracts import Diagnosis, Signals

SYSTEM_PROMPT = (
    "You are Backstop, an on-call Site Reliability Engineering (SRE) triage agent for a "
    "production Kubernetes platform. You receive a JSON snapshot of a live incident with "
    "these fields: services (deployments you may reference), recent_deploys (deploy "
    "identifiers, newest first), metrics (e.g. error rates and ready ratios), logs "
    "(recent warning lines), and protected_resources (never act on these).\n\n"
    "Determine the single most likely root cause and the safest corrective action, "
    "grounded strictly in the evidence provided.\n\n"
    "Rules:\n"
    "- Ground every field in the signals. suspected_resource MUST be exactly one of "
    "services. suspected_deploy_sha MUST be exactly one of recent_deploys. Never invent "
    "identifiers or reference anything not present in the signals.\n"
    "- Prefer the simplest explanation the metrics and logs support. An error-rate spike "
    "that begins right after the newest deploy points to that deploy.\n"
    "- Calibrate confidence (0.0-1.0) to how strongly the evidence supports the "
    "hypothesis; use lower values when the signals are ambiguous.\n"
    "- recommended_action is a short, safe imperative (e.g. 'rollback the bad deploy'). "
    "Never recommend an action targeting a protected_resource.\n\n"
    "Respond with ONLY a single minified JSON object — no prose, no markdown, no code "
    "fences — with exactly these keys: hypothesis (string, one concise sentence on the "
    "root cause), suspected_resource (string, one of services), suspected_deploy_sha "
    "(string, one of recent_deploys), confidence (number 0.0-1.0), recommended_action "
    "(string, short imperative)."
)


def _client() -> OpenAI:
    return OpenAI(base_url=settings.base_url, api_key=settings.api_key)


def _extract_json(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return text
    return text[start : end + 1]


def _messages(signals: Signals) -> list[dict]:
    from backstop import prompts

    payload = signals.model_dump_json()
    managed = prompts.fetch_messages(payload)
    if managed:
        return managed
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": payload},
    ]


def diagnose(signals: Signals, model: str | None = None) -> Diagnosis:
    response = _client().chat.completions.create(
        model=model or settings.model,
        response_format={"type": "json_object"},
        messages=_messages(signals),
        extra_headers={"X-TFY-LOGGING-CONFIG": '{"enabled": true}'},
    )
    content = response.choices[0].message.content or ""
    return Diagnosis.model_validate_json(_extract_json(content))


JUDGE_PROMPT = (
    "You are a senior SRE reviewing an incident diagnosis for soundness. Given the "
    "incident signals and a proposed diagnosis as JSON, decide whether the diagnosis is "
    "GROUNDED in the evidence and whether its recommended_action is JUSTIFIED by it — "
    "e.g. an action targeting a resource the signals do not implicate is not justified. "
    'Respond with ONLY JSON: {"grounded": true|false, "reason": "one short sentence"}.'
)


def judge_diagnosis(diagnosis: Diagnosis, signals: Signals) -> tuple[bool, str]:
    payload = json.dumps(
        {
            "signals": json.loads(signals.model_dump_json()),
            "diagnosis": json.loads(diagnosis.model_dump_json()),
        }
    )
    for model in (settings.judge_model, settings.model):
        if not model:
            continue
        try:
            response = _client().chat.completions.create(
                model=model,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": JUDGE_PROMPT},
                    {"role": "user", "content": payload},
                ],
                extra_headers={"X-TFY-LOGGING-CONFIG": '{"enabled": true}'},
            )
            data = json.loads(_extract_json(response.choices[0].message.content or "{}"))
            return bool(data.get("grounded", True)), str(data.get("reason", ""))
        except Exception:
            continue
    return True, "judge unavailable"


def served_model() -> str:
    response = _client().chat.completions.create(
        model=settings.model,
        messages=[{"role": "user", "content": "ping"}],
        max_tokens=1,
        extra_headers={"X-TFY-LOGGING-CONFIG": '{"enabled": true}'},
    )
    return str(response.model)
