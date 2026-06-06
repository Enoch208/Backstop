from backstop.demo import HARDENED_NAMESPACE, NAIVE_NAMESPACE
from backstop.infra.base import InfraBackend
from backstop.infra.k8s import K8sBackend

NAMESPACES = {"naive": NAIVE_NAMESPACE, "hardened": HARDENED_NAMESPACE}


def make_backends() -> tuple[InfraBackend, InfraBackend]:
    return K8sBackend(NAIVE_NAMESPACE), K8sBackend(HARDENED_NAMESPACE)


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
