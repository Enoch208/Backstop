from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

from backstop.config import settings


def _client() -> Client:
    transport = StreamableHttpTransport(
        settings.mcp_url, auth=f"Bearer {settings.api_key}"
    )
    return Client(transport=transport)


async def list_tools() -> list[str]:
    async with _client() as client:
        return [tool.name for tool in await client.list_tools()]


async def call_tool(name: str, arguments: dict) -> str:
    async with _client() as client:
        result = await client.call_tool(name, arguments)
        return str(result)
