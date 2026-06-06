export type Severity = "info" | "amber" | "red" | "green";

export type EventKind =
  | "step"
  | "gate"
  | "fallback"
  | "action"
  | "blocked"
  | "breaker"
  | "done";

export type RunEvent = {
  run_id: string;
  agent: string;
  kind: EventKind;
  label: string;
  detail: string;
  severity: Severity;
  data: Record<string, unknown>;
};

export type DeploymentState = { ready: number; desired: number };

export type ClusterState = Record<
  string,
  { checkout: DeploymentState; prod_db: DeploymentState }
>;
