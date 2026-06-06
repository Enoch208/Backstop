import { ClusterState, DeploymentState } from "./types";

function statusColor(state: DeploymentState): string {
  if (state.desired > 0 && state.ready === state.desired) return "text-emerald-400";
  if (state.ready === 0) return "text-red-400";
  return "text-amber-400";
}

function Row({ name, state }: { name: string; state: DeploymentState }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="font-mono text-xs text-zinc-500">{name}</span>
      <span className={`font-mono text-xs ${statusColor(state)}`}>
        {state.ready}/{state.desired}
      </span>
    </div>
  );
}

export default function ClusterWidget({ state }: { state: ClusterState | null }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
      <h3 className="text-sm font-semibold text-white">Live cluster</h3>
      <p className="mt-1 mb-4 text-[11px] font-extralight text-zinc-500">
        Real Kubernetes, polled every 2s.
      </p>
      {!state ? (
        <p className="text-xs font-extralight text-zinc-600">
          Connecting to cluster…
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(state).map(([namespace, deployments]) => (
            <div
              key={namespace}
              className="rounded-xl border border-white/[0.05] bg-black/30 p-3"
            >
              <div className="mb-1 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                {namespace}
              </div>
              <Row name="checkout" state={deployments.checkout} />
              <Row name="prod-db" state={deployments.prod_db} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
