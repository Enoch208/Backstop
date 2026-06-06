"use client";

import { Icon } from "@iconify/react";
import { DeploymentState } from "../types";
import { useClusterState } from "../useRunStream";

function tone(state: DeploymentState): string {
  if (state.desired > 0 && state.ready === state.desired) return "text-emerald-400";
  if (state.ready === 0) return "text-red-400";
  return "text-amber-400";
}

function Deployment({ name, state }: { name: string; state: DeploymentState }) {
  const ratio = state.desired ? (state.ready / state.desired) * 100 : 0;
  return (
    <div className="border-t border-white/[0.05] py-4 first:border-t-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-sm text-zinc-300">{name}</span>
        <span className={`font-mono text-sm ${tone(state)}`}>
          {state.ready}/{state.desired} ready
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${state.ready === state.desired ? "bg-emerald-500" : state.ready === 0 ? "bg-red-500" : "bg-amber-500"}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

export default function ClusterPage() {
  const state = useClusterState();

  return (
    <>
      <header className="border-b border-white/[0.06] px-8 py-6">
        <h1 className="text-2xl font-light tracking-tight">Cluster</h1>
        <p className="mt-1 text-sm font-extralight text-zinc-500">
          Live Kubernetes state across both demo namespaces, polled every 2s.
        </p>
      </header>

      <div className="p-8">
        {!state ? (
          <p className="text-sm font-extralight text-zinc-600">
            Connecting to cluster… (is the backend API running?)
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(state).map(([namespace, deployments]) => (
              <div
                key={namespace}
                className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6"
              >
                <div className="mb-4 flex items-center gap-2 text-zinc-400">
                  <Icon icon="solar:server-square-linear" className="text-lg" />
                  <span className="font-mono text-sm">{namespace}</span>
                </div>
                <Deployment name="checkout" state={deployments.checkout} />
                <Deployment name="prod-db" state={deployments.prod_db} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
