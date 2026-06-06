import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    base_url = os.getenv("TRUEFOUNDRY_BASE_URL", "")
    api_key = os.getenv("TRUEFOUNDRY_API_KEY", "")
    model = os.getenv("BACKSTOP_MODEL", "prod-triage")
    judge_model = os.getenv("BACKSTOP_JUDGE_MODEL", "bedrock/anthropic.claude-3-5-haiku")
    guardrail_url = os.getenv("GUARDRAIL_URL", "http://localhost:8081")
    backend = os.getenv("BACKSTOP_BACKEND", "kind")
    namespace = os.getenv("K8S_NAMESPACE", "backstop-demo")
    settle_seconds = int(os.getenv("BACKSTOP_SETTLE_SECONDS", "10"))


settings = Settings()
