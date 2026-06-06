import { Icon } from "@iconify/react";

function label(model: string): string {
  const m = model.toLowerCase();
  if (m.startsWith("error")) return "error";
  if (m.includes("sonnet")) return "Claude Sonnet";
  if (m.includes("haiku")) return "Claude Haiku";
  if (m.includes("opus")) return "Claude Opus";
  if (m.includes("llama")) return "Llama";
  if (m.includes("nova")) return "Nova";
  return model;
}

export default function FallbackStrip({ calls }: { calls: string[] }) {
  const primary = calls.length ? label(calls[0]) : "";
  const failedOver = calls.some((c) => label(c) !== primary);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon icon="solar:routing-2-linear" className="text-accent-2" />
          AI Gateway fallback chain
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            failedOver
              ? "border-accent/40 bg-accent/10 text-accent-2"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {failedOver ? "Failover observed" : "Primary healthy"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {calls.map((model, index) => {
          const name = label(model);
          const isPrimary = name === primary;
          return (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <Icon
                  icon="solar:alt-arrow-right-linear"
                  className="text-xs text-zinc-600"
                />
              )}
              <span
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${
                  name === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : isPrimary
                      ? "border-white/[0.08] bg-black/40 text-zinc-300"
                      : "border-accent/40 bg-accent/10 text-accent-2"
                }`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
