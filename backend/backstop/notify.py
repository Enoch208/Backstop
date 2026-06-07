from backstop import mcp
from backstop.config import settings

SLACK_NAMES = ["slack_post_message", "post_message", "chat_postMessage", "send_message"]
SLACK_CONTAINS = ["post", "message"]
LINEAR_NAMES = ["save_issue", "create_issue"]
LINEAR_CONTAINS = ["issue", "create"]


def _pick(tools: list[str], exact: list[str], contains_all: list[str]) -> str | None:
    for name in exact:
        for tool in tools:
            if tool == name or tool.startswith(name):
                return tool
    for tool in tools:
        low = tool.lower()
        if all(part in low for part in contains_all):
            return tool
    return None


async def _call(
    tool: str, arguments: dict, label: str, ok_detail: str
) -> tuple[str, str, bool]:
    try:
        await mcp.call_tool(tool, arguments)
        return (label, ok_detail, True)
    except Exception as exc:
        return (label, f"{label.lower()} failed: {str(exc)[:80]}", False)


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
                "paged on-call through the MCP Gateway",
            )
        )
    if linear:
        arguments = {"title": headline, "description": detail}
        if settings.linear_team:
            arguments["team"] = settings.linear_team
        results.append(
            await _call(
                linear,
                arguments,
                "Opened incident ticket in Linear",
                "opened a Linear ticket through the MCP Gateway",
            )
        )
    if not results:
        results.append(("No notify tools found", f"{len(tools)} MCP tools available", False))
    return results
