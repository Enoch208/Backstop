from backstop.contracts import ProposedAction, Signals
from backstop.demo import HARDENED_NAMESPACE, NAIVE_NAMESPACE
from backstop.infra.base import InfraBackend
from backstop.infra.k8s import K8sBackend

NAMESPACES = {"naive": NAIVE_NAMESPACE, "hardened": HARDENED_NAMESPACE}


class ApplyFailsBackend(InfraBackend):
    def __init__(self, backend: InfraBackend):
        self._backend = backend

    def gather(self) -> Signals:
        return self._backend.gather()

    def inject_incident(self) -> None:
        self._backend.inject_incident()

    def apply(self, action: ProposedAction) -> str:
        raise RuntimeError("kube API unreachable: connection refused")


def make_backends() -> tuple[InfraBackend, InfraBackend]:
    return K8sBackend(NAIVE_NAMESPACE), K8sBackend(HARDENED_NAMESPACE)


def with_tool_failure(backend: InfraBackend) -> InfraBackend:
    return ApplyFailsBackend(backend)


def reset_all() -> None:
    for namespace in NAMESPACES.values():
        K8sBackend(namespace).reset()


def get_state() -> dict:
    state = {}
    for label, namespace in NAMESPACES.items():
        backend = K8sBackend(namespace)
        state[label] = {
            "checkout": backend.deployment_state("checkout"),
            "prod_db": backend.deployment_state("prod-db"),
        }
    return state
