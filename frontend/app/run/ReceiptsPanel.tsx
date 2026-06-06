import { Icon } from "@iconify/react";
import { RunEvent } from "./types";

const CAPABILITIES = [
  { feature: "Scoped MCP (read-only)", icon: "solar:eye-linear" },
  { feature: "Custom Guardrail", icon: "solar:shield-check-linear" },
  { feature: "AI Gateway", icon: "solar:routing-2-linear" },
  { feature: "Scoped MCP (narrow-write)", icon: "solar:pen-2-linear" },
];

export default function ReceiptsPanel({ events }: { events: RunEvent[] }) {
  const engaged = new Set(
    events
      .map((event) => event.data?.feature)
      .filter((feature): feature is string => typeof feature === "string"),
  );

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
      <h3 className="text-sm font-semibold text-white">TrueFoundry receipts</h3>
      <p className="mt-1 mb-5 text-[11px] font-extralight text-zinc-500">
        Capabilities engaged this run.
      </p>
      <div className="flex flex-col gap-2">
        {CAPABILITIES.map((capability) => {
          const active = engaged.has(capability.feature);
          return (
            <div
              key={capability.feature}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                active
                  ? "border-accent/40 bg-accent/10 text-accent-2"
                  : "border-white/[0.05] text-zinc-600"
              }`}
            >
              <Icon icon={capability.icon} className="text-base" />
              <span className="flex-1">{capability.feature}</span>
              {active && (
                <Icon icon="solar:check-circle-bold" className="text-sm" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
