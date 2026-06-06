from backstop.contracts import Diagnosis, Signals, Verdict

MIN_CONFIDENCE = 0.5


def check_quality(diagnosis: Diagnosis, signals: Signals) -> Verdict:
    checks = {
        "grounded_resource": diagnosis.suspected_resource in signals.services,
        "grounded_sha": diagnosis.suspected_deploy_sha in signals.recent_deploys,
        "confidence": diagnosis.confidence >= MIN_CONFIDENCE,
    }
    reasons = [f"{name} failed" for name, ok in checks.items() if not ok]
    return Verdict(passed=all(checks.values()), checks=checks, reasons=reasons)
