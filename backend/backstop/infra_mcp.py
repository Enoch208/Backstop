from fastmcp import FastMCP

from backstop.demo import HARDENED_NAMESPACE, NAIVE_NAMESPACE
from backstop.infra.k8s import K8sBackend

server = FastMCP("Backstop Infra")


@server.tool
def get_signals(namespace: str = HARDENED_NAMESPACE) -> dict:
    return K8sBackend(namespace).gather().model_dump()


@server.tool
def deployment_status(namespace: str = HARDENED_NAMESPACE) -> dict:
    backend = K8sBackend(namespace)
    return {
        "checkout": backend.deployment_state("checkout"),
        "prod_db": backend.deployment_state("prod-db"),
    }


@server.tool
def namespaces() -> list[str]:
    return [NAIVE_NAMESPACE, HARDENED_NAMESPACE]


if __name__ == "__main__":
    server.run(transport="streamable-http", host="127.0.0.1", port=8233, path="/mcp")
