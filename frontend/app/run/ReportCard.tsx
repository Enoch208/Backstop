import { Icon } from "@iconify/react";
import { IncidentReport } from "./types";

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

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-7">
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
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${outcome.className}`}
        >
          {outcome.label}
        </span>
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
    </div>
  );
}
