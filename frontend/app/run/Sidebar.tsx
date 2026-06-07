"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Wordmark from "../components/Wordmark";
import { TFY_OBSERVABILITY_URL } from "../lib/api";

const NAV = [
  { label: "Live Run", icon: "solar:play-circle-linear", href: "/run" },
  { label: "Incidents", icon: "solar:danger-triangle-linear", href: "/run/incidents" },
  { label: "Cluster", icon: "solar:server-square-linear", href: "/run/cluster" },
  { label: "Guardrails", icon: "solar:shield-check-linear", href: "/run/guardrails" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0b0b0d] px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:overflow-y-auto">
      <Link href="/run" className="px-2 pb-8">
        <Wordmark size={28} />
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/[0.07] text-white"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              }`}
            >
              <Icon icon={item.icon} className="text-lg" />
              {item.label}
            </Link>
          );
        })}
        <a
          href={TFY_OBSERVABILITY_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
        >
          <Icon icon="solar:chart-2-linear" className="text-lg" />
          Observability
          <Icon icon="solar:arrow-right-up-linear" className="ml-auto text-sm opacity-60" />
        </a>
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
