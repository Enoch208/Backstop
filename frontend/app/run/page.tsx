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

const SCENARIOS = [
  {
    id: "hallucination",
    label: "Hallucinated diagnosis",
    icon: "solar:ghost-linear",
    note: "quality gate + LLM-judge catch the wrong output",
  },
  {
    id: "cascade",
    label: "Cascading failure",
    icon: "solar:bolt-circle-linear",
    note: "stays wrong → circuit breaker trips → escalate",
  },
  {
    id: "clean",
    label: "Clean signal",
    icon: "solar:check-circle-linear",
    note: "grounded diagnosis → every gate passes → resolve",
  },
];

const NAIVE_PIPELINE = [
  { label: "Diagnose", note: "one model — trusts the first output" },
  { label: "Execute", note: "every tool in hand, nothing checked" },
];

const HARDENED_PIPELINE = [
  { label: "Gather signals", note: "read-only snapshot of the cluster" },
  { label: "Redact secrets", note: "PII masked before the model sees it" },
  { label: "Diagnose", note: "structured output via the AI Gateway" },
  {
    label: "Quality gate + LLM-as-judge",
    note: "is the diagnosis grounded in evidence?",
    gate: true,
  },
  {
    label: "Action gate",
    note: "blast radius · protected resources · evidence match",
    gate: true,
  },
  { label: "Execute (scoped)", note: "only a validated write reaches the cluster" },
  { label: "Notify", note: "page on-call + file a ticket via MCP Gateway" },
];

export default function RunPage() {
  const [runIds, setRunIds] = useState<RunIds | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [fallback, setFallback] = useState<string[] | null>(null);

  const naiveEvents = useRunStream(runIds?.naive ?? null);
  const hardenedEvents = useRunStream(runIds?.hardened ?? null);
  const cluster = useClusterState();

  const triggerIncident = async (scenario: string = "hallucination") => {
    setBusy(true);
    setReport(null);
    setFallback(null);
    try {
      const response = await fetch(`${API_BASE}/demo?scenario=${scenario}`, {
        method: "POST",
      });
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
      <header id="top" className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Incident Console</h1>
            <p className="mt-1 text-sm font-extralight text-zinc-500">
              Same alert, two agents — naive vs Backstop, on a real cluster.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#131315] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <Icon icon="solar:restart-linear" className="text-base" />
            Reset
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-4 sm:px-6 lg:px-8">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            Inject failure
          </span>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              title={scenario.note}
              onClick={() => triggerIncident(scenario.id)}
              disabled={busy}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#131315] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              <Icon icon={scenario.icon} className="text-base" />
              {scenario.label}
            </button>
          ))}
          <button
            type="button"
            title="6 rapid calls — watch the gateway fail Sonnet over to Llama"
            onClick={testFallback}
            disabled={busy}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#131315] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <Icon icon="solar:routing-2-linear" className="text-base" />
            Model failover
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {!runIds && (
            <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#16161c] to-[#0d0d10] p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2563eb]/25 bg-[#2563eb]/10">
                  <Icon
                    icon="solar:shield-network-linear"
                    className="text-2xl text-accent-2"
                  />
                </span>
                <div>
                  <h2 className="text-base font-medium text-white">
                    A live incident drill — fail-safe, not just fail-over
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm font-extralight leading-relaxed text-zinc-400">
                    The same poisoned alert hits both agents. The naive one acts on
                    a hallucinated diagnosis and takes the production database to
                    zero. Backstop catches the bad output, re-routes to a stronger
                    model, and rolls the real deploy back — on a live Kubernetes
                    cluster, through the TrueFoundry gateway.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "Real Kubernetes",
                      "AWS Bedrock",
                      "Gateway + fallback",
                      "MCP Gateway",
                      "Guardrails",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => triggerIncident("hallucination")}
                disabled={busy}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_2px_18px_rgba(255,255,255,0.18)] transition-all hover:bg-zinc-100 active:scale-95 disabled:opacity-50"
              >
                <Icon icon="solar:bolt-linear" className="text-base" />
                Run the drill
              </button>
            </div>
          )}

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

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_20rem]">
            <div id="incidents" className="grid scroll-mt-6 grid-cols-1 items-start gap-6 lg:grid-cols-2">
              <AgentColumn
                title="Naive agent"
                subtitle="one model · all tools · no guardrails"
                tone="naive"
                events={naiveEvents}
                running={Boolean(runIds) && !naiveDone}
                pipeline={NAIVE_PIPELINE}
              />
              <AgentColumn
                title="Backstop"
                subtitle="scoped tools · quality + action gates"
                tone="hardened"
                events={hardenedEvents}
                running={Boolean(runIds) && !hardenedDone}
                pipeline={HARDENED_PIPELINE}
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
