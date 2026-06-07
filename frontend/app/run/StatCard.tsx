import { Icon } from "@iconify/react";

type Tone = "neutral" | "accent" | "danger" | "success";

const TONE: Record<Tone, { value: string; chip: string; ring: string }> = {
  neutral: {
    value: "text-white",
    chip: "border-white/10 bg-white/[0.04] text-zinc-300",
    ring: "",
  },
  accent: {
    value: "text-accent-2",
    chip: "border-[#2563eb]/30 bg-[#2563eb]/10 text-accent-2",
    ring: "shadow-[inset_0_0_0_1px_rgba(37,99,235,0.18)]",
  },
  danger: {
    value: "text-red-400",
    chip: "border-red-500/30 bg-red-500/10 text-red-400",
    ring: "shadow-[inset_0_0_0_1px_rgba(239,68,68,0.18)]",
  },
  success: {
    value: "text-emerald-400",
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    ring: "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]",
  },
};

type StatCardProps = {
  icon: string;
  label: string;
  value: string;
  hint: string;
  tone?: Tone;
};

export default function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
}: StatCardProps) {
  const t = TONE[tone];
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-[#131315] p-6 transition-all duration-200 hover:border-white/[0.12] ${t.ring}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${t.chip}`}
        >
          <Icon icon={icon} className="text-lg" />
        </span>
      </div>
      <div className={`text-5xl font-light tracking-tighter ${t.value}`}>
        {value}
      </div>
      <p className="mt-2 text-xs font-extralight text-zinc-500">{hint}</p>
    </div>
  );
}
