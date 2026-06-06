from backstop.config import settings
from backstop.infra.base import InfraBackend


def get_backend() -> InfraBackend:
    if settings.backend in ("k8s", "kind"):
        from backstop.infra.k8s import K8sBackend

        return K8sBackend()

    from backstop.infra.mock import MockBackend

    return MockBackend()
