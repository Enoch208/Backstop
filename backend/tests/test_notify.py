from backstop import mcp, notify


async def test_notify_picks_slack_and_linear_tools(monkeypatch):
    calls = []

    async def fake_list_tools():
        return ["slack_post_message", "linear_create_issue", "github_search"]

    async def fake_call_tool(name, arguments):
        calls.append((name, arguments))
        return "ok"

    monkeypatch.setattr(mcp, "list_tools", fake_list_tools)
    monkeypatch.setattr(mcp, "call_tool", fake_call_tool)

    results = await notify.notify_incident("Resolved: bad deploy", "rolled back checkout")

    tools_called = [name for name, _ in calls]
    assert "slack_post_message" in tools_called
    assert "linear_create_issue" in tools_called
    assert all(ok for _, _, ok in results)


async def test_notify_handles_unreachable_gateway(monkeypatch):
    async def fail():
        raise RuntimeError("connection refused")

    monkeypatch.setattr(mcp, "list_tools", fail)
    results = await notify.notify_incident("x", "y")
    assert results[0][2] is False
