from openai import OpenAI

from backstop.config import settings
from backstop.contracts import Diagnosis, Signals

SYSTEM_PROMPT = (
    "You are an on-call SRE triage agent. You are given incident signals as JSON. "
    "Respond with ONLY a JSON object with keys: hypothesis, suspected_resource, "
    "suspected_deploy_sha, confidence, recommended_action. suspected_resource must be "
    "one of the listed services. suspected_deploy_sha must be one of the listed "
    "recent_deploys. confidence is a number between 0 and 1. recommended_action is a "
    "short imperative like 'rollback the bad deploy'."
)


def _client() -> OpenAI:
    return OpenAI(base_url=settings.base_url, api_key=settings.api_key)


def diagnose(signals: Signals, model: str | None = None) -> Diagnosis:
    response = _client().chat.completions.create(
        model=model or settings.model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": signals.model_dump_json()},
        ],
    )
    return Diagnosis.model_validate_json(response.choices[0].message.content)
