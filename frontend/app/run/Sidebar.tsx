import { Icon } from "@iconify/react";
import Wordmark from "../components/Wordmark";

const NAV = [
  { label: "Live Run", icon: "solar:play-circle-linear", active: true },
  { label: "Incidents", icon: "solar:danger-triangle-linear", active: false },
  { label: "Cluster", icon: "solar:server-square-linear", active: false },
  { label: "Guardrails", icon: "solar:shield-check-linear", active: false },
  { label: "Observability", icon: "solar:chart-2-linear", active: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0b0b0d] px-4 py-6 lg:flex">
      <div className="px-2 pb-8">
        <Wordmark size={28} />
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              item.active
                ? "bg-white/[0.07] text-white"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
            }`}
          >
            <Icon icon={item.icon} className="text-lg" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/[0.06] bg-[#131315] p-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-accent-2">
          <Icon icon="solar:shield-keyhole-linear" />
          Fail-safe mode
        </div>
        <p className="text-[11px] leading-relaxed font-extralight text-zinc-500">
          Destructive actions are gated before they ever reach the cluster.
        </p>
      </div>
    </aside>
  );
}
