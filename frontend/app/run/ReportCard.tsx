"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { API_BASE } from "../lib/api";
import { IncidentReport } from "./types";

type IncidentReceipt = {
  run_id: string;
  scenario: string;
  integrity_sha256: string;
  features_engaged: string[];
  issued_at: string;
};

const OUTCOME: Record<string, { label: string; className: string }> = {
  resolved: {
    label: "Resolved safely",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  escalated: {
    label: "Escalated to human",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  running: {
    label: "In progress",
    className: "border-white/[0.08] bg-white/[0.04] text-zinc-400",
  },
};

function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
        <Icon icon={icon} className="text-sm" />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ReportCard({ report }: { report: IncidentReport }) {
  const outcome = OUTCOME[report.outcome] ?? OUTCOME.running;
  const [receipt, setReceipt] = useState<IncidentReceipt | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/receipt/${report.run_id}`)
      .then((response) => response.json())
      .then((data) => {
        if (active) setReceipt(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [report.run_id]);

  const downloadReceipt = () => {
    if (!receipt) return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `backstop-receipt-${report.run_id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="report" className="scroll-mt-6 rounded-2xl border border-white/[0.06] bg-[#131315] p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-black/40 text-accent-2">
            <Icon icon="solar:document-text-linear" className="text-lg" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">Incident report</h3>
            <p className="text-[11px] font-extralight text-zinc-500">
              Auto-generated postmortem · {report.failures_handled} failure(s) handled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadReceipt}
            disabled={!receipt}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0b0b0d] px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <Icon icon="solar:download-minimalistic-linear" className="text-sm" />
            Audit receipt
          </button>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${outcome.className}`}
          >
            {outcome.label}
          </span>
        </div>
      </div>

      <p className="mb-7 text-lg font-light text-zinc-200">{report.summary}</p>

      <div className="grid grid-cols-1 gap-7 border-t border-white/[0.06] pt-6 md:grid-cols-3">
        <Section icon="solar:magnifer-linear" title="Root cause">
          <p className="text-sm font-extralight text-zinc-400">
            {report.root_cause}
          </p>
        </Section>

        <Section icon="solar:shield-cross-linear" title="What Backstop caught">
          {report.caught.length === 0 ? (
            <p className="text-sm font-extralight text-zinc-600">Nothing flagged.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {report.caught.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm font-extralight text-zinc-400">
                  <Icon
                    icon="solar:shield-cross-linear"
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon="solar:bolt-linear" title="Actions taken">
          {report.actions_taken.length === 0 ? (
            <p className="text-sm font-extralight text-zinc-600">
              No action executed.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {report.actions_taken.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm font-extralight text-zinc-400">
                  <Icon
                    icon="solar:check-circle-linear"
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {receipt && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-2 text-[11px] font-extralight text-zinc-500">
            <Icon icon="solar:shield-check-linear" className="text-accent-2" />
            Tamper-evident receipt · sha256{" "}
            <span className="font-mono text-zinc-400">
              {receipt.integrity_sha256.slice(0, 16)}…
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {receipt.features_engaged.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-zinc-400"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
