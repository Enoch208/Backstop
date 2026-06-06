class CircuitBreaker:
    def __init__(self, budget: int = 3):
        self.budget = budget
        self.anomalies = 0

    def record_anomaly(self) -> None:
        self.anomalies += 1

    @property
    def tripped(self) -> bool:
        return self.anomalies >= self.budget
