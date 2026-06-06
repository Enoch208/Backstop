import { Icon } from "@iconify/react";
import { RunEvent, Severity } from "./types";

const SEVERITY_TEXT: Record<Severity, string> = {
  info: "text-zinc-300",
  amber: "text-amber-400",
  red: "text-red-400",
  green: "text-emerald-400",
};

const KIND_ICON: Record<string, string> = {
  step: "solar:double-alt-arrow-right-linear",
  gate: "solar:shield-check-linear",
  fallback: "solar:routing-2-linear",
  action: "solar:bolt-linear",
  blocked: "solar:shield-cross-linear",
  breaker: "solar:bolt-circle-linear",
  done: "solar:flag-linear",
};

export default function EventRow({ event }: { event: RunEvent }) {
  const tone = SEVERITY_TEXT[event.severity];
  const feature =
    typeof event.data?.feature === "string" ? event.data.feature : null;

  return (
    <div className="flex gap-3 border-b border-white/[0.05] px-5 py-3.5 last:border-b-0">
      <Icon
        icon={KIND_ICON[event.kind] ?? "solar:record-circle-linear"}
        className={`mt-0.5 shrink-0 text-lg ${tone}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-medium ${tone}`}>{event.label}</span>
          {feature && (
            <span className="rounded-full border border-white/[0.08] bg-black/40 px-2 py-0.5 text-[10px] tracking-wide text-zinc-500">
              {feature}
            </span>
          )}
        </div>
        {event.detail && (
          <p className="mt-0.5 truncate text-xs font-extralight text-zinc-500">
            {event.detail}
          </p>
        )}
      </div>
    </div>
  );
}
