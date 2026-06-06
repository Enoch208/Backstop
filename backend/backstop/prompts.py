import os

from backstop.config import settings

_manifest = None


def _template():
    global _manifest
    if _manifest is None:
        os.environ.setdefault("TFY_API_KEY", settings.api_key)
        os.environ.setdefault("TFY_HOST", settings.tfy_host)
        from truefoundry import client

        _manifest = client.prompt_versions.get_by_fqn(
            fqn=settings.prompt_fqn
        ).data.manifest
    return _manifest


def fetch_messages(signals_json: str) -> list[dict] | None:
    if not settings.prompt_fqn:
        return None
    try:
        from truefoundry import render_prompt

        rendered = render_prompt(_template(), variables={"signals": signals_json})
        return rendered["messages"]
    except Exception:
        return None
