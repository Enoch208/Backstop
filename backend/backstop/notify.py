from backstop import mcp
from backstop.config import settings

SLACK_NAMES = ["slack_post_message", "post_message", "chat_postMessage", "send_message"]
SLACK_CONTAINS = ["post", "message"]
LINEAR_NAMES = ["save_issue", "create_issue"]
LINEAR_CONTAINS = ["issue", "create"]


def _pick(tools: list[str], exact: list[str], contains_all: list[str]) -> str | None:
    for name in exact:
        if name in tools:
            return name
    for name in tools:
        low = name.lower()
        if all(part in low for part in contains_all):
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
    slack = _pick(tools, SLACK_NAMES, SLACK_CONTAINS)
    linear = _pick(tools, LINEAR_NAMES, LINEAR_CONTAINS)

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
