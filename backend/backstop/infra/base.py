from abc import ABC, abstractmethod

from backstop.contracts import ProposedAction, Signals


class InfraBackend(ABC):
    @abstractmethod
    def gather(self) -> Signals: ...

    @abstractmethod
    def apply(self, action: ProposedAction) -> str: ...

    @abstractmethod
    def inject_incident(self) -> None: ...
