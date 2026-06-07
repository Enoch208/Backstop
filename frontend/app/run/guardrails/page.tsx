import { Icon } from "@iconify/react";

const GUARDRAILS = [
  {
    icon: "solar:eye-closed-linear",
    name: "PII redaction",
    type: "Input · Mutate · registered in TrueFoundry",
    desc: "Masks secrets (credentials, tokens, IPs) in the gathered signals before the model ever sees them.",
    checks: ["connection strings", "api keys / tokens", "emails", "ip addresses"],
  },
  {
    icon: "solar:check-read-linear",
    name: "Quality gate",
    type: "Output · Validate · registered in TrueFoundry",
    desc: "Rejects ungrounded diagnoses before any action is planned.",
    checks: [
      "suspected_resource ∈ services",
      "suspected_deploy_sha ∈ recent_deploys",
      "confidence ≥ 0.5",
    ],
  },
  {
    icon: "solar:shield-warning-linear",
    name: "Action-validation gate",
    type: "Pre-execution · in-agent",
    desc: "The last line of defense — validates the proposed write against policy before it touches the cluster.",
    checks: [
      "blast radius (no scope=all)",
      "no protected resources (prod-db, payments)",
      "target actually exists",
      "action matches the diagnosis",
    ],
  },
  {
    icon: "solar:bolt-circle-linear",
    name: "Cascade circuit breaker",
    type: "Resilience · in-agent",
    desc: "A running anomaly budget across steps. Trips and escalates to a human instead of amplifying a cascading failure.",
    checks: ["counts blocked gates + tool errors", "trips at budget", "escalates to a human"],
  },
];

export default function GuardrailsPage() {
  return (
    <>
      <header className="border-b border-white/[0.06] px-8 py-6">
        <h1 className="text-2xl font-light tracking-tight">Guardrails</h1>
        <p className="mt-1 text-sm font-extralight text-zinc-500">
          The safety layer that stops a wrong model output from becoming a destructive action.
        </p>
      </header>

      <div className="grid gap-6 p-8 md:grid-cols-2">
        {GUARDRAILS.map((g) => (
          <div
            key={g.name}
            className="rounded-2xl border border-white/[0.06] bg-[#131315] p-6"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-black/40 text-accent-2">
                <Icon icon={g.icon} className="text-lg" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">{g.name}</h3>
                <p className="text-[11px] tracking-wide text-zinc-500 uppercase">
                  {g.type}
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm font-extralight text-zinc-400">{g.desc}</p>
            <div className="flex flex-wrap gap-2">
              {g.checks.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/[0.06] bg-black/30 px-2.5 py-1 font-mono text-[11px] text-zinc-400"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
