"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { API_BASE } from "../lib/api";
import AgentColumn from "./AgentColumn";
import ClusterWidget from "./ClusterWidget";
import FallbackStrip from "./FallbackStrip";
import ReceiptsPanel from "./ReceiptsPanel";
import ReportCard from "./ReportCard";
import StatCard from "./StatCard";
import { IncidentReport } from "./types";
import { useClusterState, useRunStream } from "./useRunStream";

type RunIds = { naive: string; hardened: string };

export default function RunPage() {
  const [runIds, setRunIds] = useState<RunIds | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [fallback, setFallback] = useState<string[] | null>(null);

  const naiveEvents = useRunStream(runIds?.naive ?? null);
  const hardenedEvents = useRunStream(runIds?.hardened ?? null);
  const cluster = useClusterState();

  const triggerIncident = async () => {
    setBusy(true);
    setReport(null);
    try {
      const response = await fetch(`${API_BASE}/demo`, { method: "POST" });
      const body = await response.json();
      setRunIds({ naive: body.naive, hardened: body.hardened });
    } finally {
      setBusy(false);
    }
  };

  const testFallback = async () => {
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/fallback-test?n=6`);
      const body = await response.json();
      setFallback(body.calls);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setRunIds(null);
    setReport(null);
    setFallback(null);
    setBusy(true);
    try {
      await fetch(`${API_BASE}/reset`, { method: "POST" });
    } finally {
      setBusy(false);
    }
  };

  const averted = hardenedEvents.filter((e) => e.kind === "blocked").length;
  const hardenedDone = hardenedEvents.find((e) => e.kind === "done");
  const naiveDone = naiveEvents.find((e) => e.kind === "done");
  const backstopOutcome = hardenedDone
    ? hardenedDone.severity === "green"
      ? "Resolved"
      : "Escalated"
    : runIds
      ? "Running"
      : "Idle";
  const naiveOutcome = naiveDone
    ? naiveDone.severity === "red"
      ? "Catastrophe"
      : "Acted"
    : runIds
      ? "Running"
      : "Idle";

  useEffect(() => {
    if (!runIds || !hardenedDone) return;
    let active = true;
    fetch(`${API_BASE}/report/${runIds.hardened}`)
      .then((response) => response.json())
      .then((data) => {
        if (active) setReport(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hardenedDone, runIds]);

  const deployments = cluster ? Object.values(cluster).flatMap((ns) => [ns.checkout, ns.prod_db]) : [];
  const healthy = deployments.filter((d) => d.desired > 0 && d.ready === d.desired).length;
  const integrity = deployments.length ? `${healthy}/${deployments.length}` : "—";

  return (
    <>
      <header id="top" className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-8 py-6">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Incident Console</h1>
            <p className="mt-1 text-sm font-extralight text-zinc-500">
              Same alert, two agents — naive vs Backstop, on a real cluster.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={testFallback}
              disabled={busy}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#131315] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              <Icon icon="solar:routing-2-linear" className="text-base" />
              Test fallback
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#131315] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              <Icon icon="solar:restart-linear" className="text-base" />
              Reset
            </button>
            <button
              type="button"
              onClick={triggerIncident}
              disabled={busy}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_2px_14px_rgba(255,255,255,0.14)] transition-all hover:bg-zinc-100 active:scale-95 disabled:opacity-50"
            >
              <Icon icon="solar:bolt-linear" className="text-base" />
              Trigger incident
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-8">
          {fallback && <FallbackStrip calls={fallback} />}

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            <StatCard
              icon="solar:shield-check-linear"
              label="Catastrophes averted"
              value={String(averted)}
              hint="destructive actions blocked by guardrails"
              tone="accent"
            />
            <StatCard
              icon="solar:cpu-bolt-linear"
              label="Backstop"
              value={backstopOutcome}
              hint="the fail-safe agent's outcome"
              tone={hardenedDone?.severity === "green" ? "success" : "neutral"}
            />
            <StatCard
              icon="solar:danger-triangle-linear"
              label="Naive agent"
              value={naiveOutcome}
              hint="what the unguarded agent did"
              tone={naiveDone?.severity === "red" ? "danger" : "neutral"}
            />
            <StatCard
              icon="solar:server-square-linear"
              label="Cluster integrity"
              value={integrity}
              hint="deployments ready, both namespaces"
              tone={
                deployments.length && healthy < deployments.length
                  ? "danger"
                  : "neutral"
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
            <div id="incidents" className="grid scroll-mt-6 grid-cols-1 gap-6 lg:grid-cols-2">
              <AgentColumn
                title="Naive agent"
                subtitle="one model · all tools · no guardrails"
                tone="naive"
                events={naiveEvents}
                running={Boolean(runIds) && !naiveDone}
              />
              <AgentColumn
                title="Backstop"
                subtitle="scoped tools · quality + action gates"
                tone="hardened"
                events={hardenedEvents}
                running={Boolean(runIds) && !hardenedDone}
              />
            </div>

            <div className="flex flex-col gap-6">
              <ReceiptsPanel events={[...naiveEvents, ...hardenedEvents]} />
              <ClusterWidget state={cluster} />
            </div>
          </div>

          {report && <ReportCard report={report} />}
        </div>
    </>
  );
}
