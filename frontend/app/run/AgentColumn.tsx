import { Icon } from "@iconify/react";
import EventRow from "./EventRow";
import { RunEvent } from "./types";

type Tone = "naive" | "hardened";

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
};

export default function AgentColumn({
  title,
  subtitle,
  tone,
  events,
  running,
}: AgentColumnProps) {
  const done = events.find((event) => event.kind === "done");
  const outcome = done ? OUTCOME[done.severity] : null;
  const accent = tone === "hardened" ? "text-accent-2" : "text-red-400";
  const icon =
    tone === "hardened"
      ? "solar:shield-check-linear"
      : "solar:danger-triangle-linear";

  return (
    <div className="flex h-[30rem] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131315]">
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
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm font-extralight text-zinc-600">
            Trigger an incident to watch this agent respond.
          </div>
        ) : (
          events.map((event, index) => <EventRow key={index} event={event} />)
        )}
      </div>
    </div>
  );
}
