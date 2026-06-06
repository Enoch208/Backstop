import re

from backstop.contracts import Signals

PATTERNS = [
    (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"), "[redacted-email]"),
    (
        re.compile(r"(?i)\b(password|passwd|pwd|secret|token|api[_-]?key|bearer)\b\s*[=:]\s*\S+"),
        r"\1=[redacted]",
    ),
    (re.compile(r"\b(?:sk|tfy|ghp|xox[bap])-[A-Za-z0-9._-]{6,}"), "[redacted-key]"),
    (re.compile(r"://[^:/@\s]+:[^@/\s]+@"), "://[redacted-credentials]@"),
    (re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\b"), "[redacted-ip]"),
]


def redact_text(text: str) -> str:
    for pattern, replacement in PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def redact_signals(signals: Signals) -> tuple[Signals, int]:
    redacted_logs = []
    count = 0
    for line in signals.logs:
        redacted = redact_text(line)
        if redacted != line:
            count += 1
        redacted_logs.append(redacted)
    return signals.model_copy(update={"logs": redacted_logs}), count
