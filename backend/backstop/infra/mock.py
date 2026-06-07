from backstop.contracts import ActionType, ProposedAction, Signals
from backstop.infra.base import InfraBackend


class MockBackend(InfraBackend):
    def __init__(self):
        self.services = ["checkout", "search", "web"]
        self.deploys = ["a1b2c3", "d4e5f6"]
        self.error_rate = 0.01
        self.broken_sha: str | None = None

    def gather(self) -> Signals:
        return Signals(
            services=list(self.services),
            recent_deploys=list(self.deploys),
            metrics={"checkout.error_rate": self.error_rate},
            logs=[
                f"checkout 5xx rate elevated after deploy {self.deploys[0]}",
                "db connect failed postgres://app:s3cr3t@10.0.0.5:5432 token=tfy-9f8a7b6c5d",
            ],
            protected_resources=["prod-db", "payments"],
        )

    def inject_incident(self) -> None:
        bad = "f00bad9"
        self.deploys.insert(0, bad)
        self.broken_sha = bad
        self.error_rate = 0.42

    def apply(self, action: ProposedAction) -> str:
        if action.type == ActionType.rollback_deploy:
            if action.target not in self.deploys:
                raise ValueError(f"unknown deploy {action.target}")
            if action.target == self.broken_sha:
                self.deploys.remove(action.target)
                self.broken_sha = None
                self.error_rate = 0.01
                return f"rolled back {action.target}; error rate recovered"
            return f"rolled back {action.target} with no effect on the incident"

        if action.type == ActionType.scale_service:
            if action.target not in self.services:
                raise ValueError(f"unknown service {action.target}")
            return f"scaled {action.target} to {action.replicas}"

        raise ValueError("unsupported action")
