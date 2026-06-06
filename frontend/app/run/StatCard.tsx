import { Icon } from "@iconify/react";

type Tone = "neutral" | "accent" | "danger" | "success";

const VALUE_TONE: Record<Tone, string> = {
  neutral: "text-white",
  accent: "text-accent-2",
  danger: "text-red-400",
  success: "text-emerald-400",
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
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6">
      <div className="mb-5 flex items-center gap-2 text-zinc-500">
        <Icon icon={icon} className="text-lg" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`text-4xl font-light tracking-tight ${VALUE_TONE[tone]}`}>
        {value}
      </div>
      <p className="mt-2 text-xs font-extralight text-zinc-500">{hint}</p>
    </div>
  );
}
