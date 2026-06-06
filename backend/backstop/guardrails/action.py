from backstop.contracts import ActionType, Diagnosis, ProposedAction, Signals, Verdict


def check_action(
    action: ProposedAction, diagnosis: Diagnosis, signals: Signals
) -> Verdict:
    if action.type == ActionType.rollback_deploy:
        matches_diagnosis = action.target == diagnosis.suspected_deploy_sha
    else:
        matches_diagnosis = action.target == diagnosis.suspected_resource

    checks = {
        "blast_radius": action.scope != "all",
        "protected": action.target not in signals.protected_resources,
        "target_exists": action.target in (signals.recent_deploys + signals.services),
        "matches_diagnosis": matches_diagnosis,
    }
    reasons = [f"{name} failed" for name, ok in checks.items() if not ok]
    return Verdict(passed=all(checks.values()), checks=checks, reasons=reasons)
