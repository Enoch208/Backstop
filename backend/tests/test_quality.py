from backstop.contracts import Diagnosis, Signals
from backstop.guardrails.quality import check_quality

SIGNALS = Signals(
    services=["checkout"],
    recent_deploys=["a1b2c3"],
    metrics={"checkout.error_rate": 0.4},
    logs=[],
    protected_resources=["prod-db"],
)


def diagnosis(sha: str, confidence: float = 0.9) -> Diagnosis:
    return Diagnosis(
        hypothesis="x",
        suspected_resource="checkout",
        suspected_deploy_sha=sha,
        confidence=confidence,
        recommended_action="rollback",
    )


def test_hallucinated_sha_fails_groundedness():
    verdict = check_quality(diagnosis("GHOST"), SIGNALS)
    assert verdict.passed is False
    assert verdict.checks["grounded_sha"] is False


def test_grounded_diagnosis_passes():
    assert check_quality(diagnosis("a1b2c3"), SIGNALS).passed is True


def test_low_confidence_fails():
    assert check_quality(diagnosis("a1b2c3", confidence=0.2), SIGNALS).passed is False
