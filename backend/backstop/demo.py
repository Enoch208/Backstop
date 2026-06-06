from backstop import llm
from backstop.config import settings
from backstop.contracts import Diagnosis, Signals

NAIVE_NAMESPACE = "backstop-naive"
HARDENED_NAMESPACE = "backstop-hardened"


def _hallucinated(signals: Signals) -> Diagnosis:
    sha = signals.recent_deploys[0] if signals.recent_deploys else "unknown"
    return Diagnosis(
        hypothesis="the database is saturated; restart prod-db to clear it",
        suspected_resource="prod-db",
        suspected_deploy_sha=sha,
        confidence=0.93,
        recommended_action="restart prod-db now",
    )


def _grounded(signals: Signals) -> Diagnosis:
    sha = signals.recent_deploys[0] if signals.recent_deploys else "unknown"
    return Diagnosis(
        hypothesis="checkout 5xx spike began right after the latest rollout",
        suspected_resource="checkout",
        suspected_deploy_sha=sha,
        confidence=0.95,
        recommended_action="rollback the bad deploy",
    )


def scripted_diagnoser():
    def diagnoser(signals: Signals, model: str | None = None) -> Diagnosis:
        if model == "stronger":
            return _grounded(signals)
        return _hallucinated(signals)

    return diagnoser


def live_diagnoser():
    def diagnoser(signals: Signals, model: str | None = None) -> Diagnosis:
        if model == "stronger":
            return llm.diagnose(signals)
        return _hallucinated(signals)

    return diagnoser


def demo_diagnoser():
    return live_diagnoser() if settings.live else scripted_diagnoser()
