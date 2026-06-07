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

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-2.5 border-b border-white/[0.06] bg-[#08080a]/90 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/run">
          <Wordmark size={24} />
        </Link>
        <a
          href={TFY_OBSERVABILITY_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-zinc-400"
        >
          Observability
          <Icon icon="solar:arrow-right-up-linear" className="text-sm opacity-60" />
        </a>
      </div>
      <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-white/15 bg-white/[0.07] text-white"
                  : "border-white/[0.06] text-zinc-500"
              }`}
            >
              <Icon icon={item.icon} className="text-sm" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
