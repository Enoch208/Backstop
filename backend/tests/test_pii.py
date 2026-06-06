from backstop.contracts import Signals
from backstop.guardrails.pii import redact_signals, redact_text


def test_redacts_connection_string_credentials():
    text = "connecting to postgres://app:s3cr3t@10.0.0.5:5432/db token=tfy-abc123def456"
    redacted = redact_text(text)
    assert "s3cr3t" not in redacted
    assert "tfy-abc123def456" not in redacted
    assert "10.0.0.5" not in redacted


def test_redacts_email_and_password():
    redacted = redact_text("user ops@acme.com failed login password: hunter2")
    assert "ops@acme.com" not in redacted
    assert "hunter2" not in redacted


def test_clean_text_is_unchanged():
    text = "checkout 5xx rate elevated after deploy a1b2c3"
    assert redact_text(text) == text


def test_redact_signals_counts_redactions():
    signals = Signals(
        services=["checkout"],
        recent_deploys=["a1b2c3"],
        metrics={},
        logs=["password=hunter2", "all good here"],
        protected_resources=[],
    )
    redacted, count = redact_signals(signals)
    assert count == 1
    assert "hunter2" not in redacted.logs[0]
    assert redacted.logs[1] == "all good here"
