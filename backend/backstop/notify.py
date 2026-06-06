from backstop import mcp
from backstop.config import settings

SLACK_HINTS = ("slack",)
SLACK_ACTIONS = ("post", "send", "message")
LINEAR_HINTS = ("linear",)
LINEAR_ACTIONS = ("create", "issue")


def _pick(tools: list[str], hints: tuple, actions: tuple) -> str | None:
    for name in tools:
        low = name.lower()
        if any(h in low for h in hints) and any(a in low for a in actions):
            return name
    for name in tools:
        low = name.lower()
        if any(a in low for a in actions):
            return name
    return None


async def _call(tool: str, arguments: dict, label: str) -> tuple[str, str, bool]:
    try:
        await mcp.call_tool(tool, arguments)
        return (label, f"via MCP tool {tool}", True)
    except Exception as exc:
        return (label, f"{tool} failed: {str(exc)[:80]}", False)


async def notify_incident(headline: str, detail: str) -> list[tuple[str, str, bool]]:
    try:
        tools = await mcp.list_tools()
    except Exception as exc:
        return [("MCP gateway unreachable", str(exc)[:100], False)]

    results = []
    slack = _pick(tools, SLACK_HINTS, SLACK_ACTIONS)
    linear = _pick(tools, LINEAR_HINTS, LINEAR_ACTIONS)

    if slack:
        results.append(
            await _call(
                slack,
                {"channel": settings.slack_channel, "text": f"{headline} — {detail}"},
                "Paged on-call via Slack",
            )
        )
    if linear:
        arguments = {"title": headline, "description": detail}
        if settings.linear_team:
            arguments["team"] = settings.linear_team
        results.append(
            await _call(linear, arguments, "Opened incident ticket in Linear")
        )
    if not results:
        results.append(("No notify tools found", f"{len(tools)} MCP tools available", False))
    return results
