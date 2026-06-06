from backstop.breaker import CircuitBreaker


def test_breaker_trips_when_budget_exceeded():
    breaker = CircuitBreaker(budget=3)
    breaker.record_anomaly()
    breaker.record_anomaly()
    assert breaker.tripped is False
    breaker.record_anomaly()
    assert breaker.tripped is True
