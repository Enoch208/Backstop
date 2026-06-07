import { Icon } from "@iconify/react";
import EventRow from "./EventRow";
import { RunEvent } from "./types";

type Tone = "naive" | "hardened";

export type PipelineStep = { label: string; note: string; gate?: boolean };

const OUTCOME: Record<string, { label: string; className: string }> = {
  green: {
    label: "Resolved safely",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  red: {
    label: "Catastrophe",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  amber: {
    label: "Escalated to human",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
};

type AgentColumnProps = {
  title: string;
  subtitle: string;
  tone: Tone;
  events: RunEvent[];
  running: boolean;
  pipeline: PipelineStep[];
};

export default function AgentColumn({
  title,
  subtitle,
  tone,
  events,
  running,
  pipeline,
}: AgentColumnProps) {
  const done = events.find((event) => event.kind === "done");
  const outcome = done ? OUTCOME[done.severity] : null;
  const hasEvents = events.length > 0;
  const accent = tone === "hardened" ? "text-accent-2" : "text-red-400";
  const icon =
    tone === "hardened"
      ? "solar:shield-check-linear"
      : "solar:danger-triangle-linear";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131315] ${
        hasEvents ? "h-[32rem]" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-black/40">
            <Icon icon={icon} className={`text-lg ${accent}`} />
          </span>
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="text-[11px] font-extralight text-zinc-500">
              {subtitle}
            </div>
          </div>
        </div>
        {outcome ? (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${outcome.className}`}
          >
            {outcome.label}
          </span>
        ) : running ? (
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-2" />
            Running
          </span>
        ) : (
          <span className="rounded-full border border-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-600">
            Armed
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col p-3">
            <div className="px-3 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
              {tone === "hardened"
                ? `${pipeline.length} steps · ${pipeline.filter((s) => s.gate).length} guardrails`
                : `${pipeline.length} steps · no guardrails`}
            </div>
            {pipeline.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium ${
                    step.gate
                      ? "border-accent-2/40 bg-accent-2/10 text-accent-2"
                      : "border-white/10 text-zinc-600"
                  }`}
                >
                  {step.gate ? (
                    <Icon icon="solar:shield-check-bold" className="text-[11px]" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0">
                  <div
                    className={`text-[13px] ${
                      step.gate ? "font-medium text-zinc-200" : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] font-extralight text-zinc-600">
                    {step.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          events.map((event, index) => <EventRow key={index} event={event} />)
        )}
      </div>
    </div>
  );
}
