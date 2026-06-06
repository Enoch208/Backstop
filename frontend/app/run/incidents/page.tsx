"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { API_BASE } from "../../lib/api";
import { IncidentReport } from "../types";

type Run = {
  demo_id: string;
  hardened: IncidentReport;
  naive_outcome: string;
};

const OUTCOME: Record<string, string> = {
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  escalated: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  running: "border-white/[0.08] bg-white/[0.04] text-zinc-400",
};

export default function IncidentsPage() {
  const [runs, setRuns] = useState<Run[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/runs`)
      .then((r) => r.json())
      .then((b) => {
        if (active) setRuns(b.runs);
      })
      .catch(() => {
        if (active) setRuns([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/[0.06] px-8 py-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Incidents</h1>
          <p className="mt-1 text-sm font-extralight text-zinc-500">
            Recent triage runs and their outcomes.
          </p>
        </div>
        <Link
          href="/run"
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-100"
        >
          <Icon icon="solar:bolt-linear" className="text-base" />
          New incident
        </Link>
      </header>

      <div className="p-8">
        {runs === null ? (
          <p className="text-sm font-extralight text-zinc-600">Loading…</p>
        ) : runs.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-10 text-center">
            <p className="text-sm font-extralight text-zinc-500">
              No incidents yet. Trigger one from{" "}
              <Link href="/run" className="text-accent-2 hover:underline">
                Live Run
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {runs.map((run) => (
              <div
                key={run.demo_id}
                className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-zinc-500">
                    incident {run.demo_id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                      naive: {run.naive_outcome}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${OUTCOME[run.hardened.outcome] ?? OUTCOME.running}`}
                    >
                      backstop: {run.hardened.outcome}
                    </span>
                  </div>
                </div>
                <p className="mb-3 text-sm font-light text-zinc-200">
                  {run.hardened.summary}
                </p>
                <p className="text-xs font-extralight text-zinc-500">
                  Root cause: {run.hardened.root_cause}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
