import { Icon } from "@iconify/react";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";

const STEPS = [
  {
    icon: "solar:magnifer-zoom-in-linear",
    title: "Triage",
    description:
      "Signals are gathered through read-only, scoped access — metrics, logs, recent deploys. Secrets are redacted before the model ever sees them.",
  },
  {
    icon: "solar:cpu-bolt-linear",
    title: "Diagnose",
    description:
      "The gateway routes to the primary model and requests a structured diagnosis: hypothesis, suspected resource, suspected deploy SHA, confidence, recommended action.",
  },
  {
    icon: "solar:shield-check-linear",
    title: "Validate",
    description:
      "Two custom guardrails fire: the quality gate checks groundedness and confidence; the action gate checks blast radius and that the fix matches the evidence. Fail → re-route or escalate.",
  },
  {
    icon: "solar:rocket-2-linear",
    title: "Execute or escalate",
    description:
      "Only validated, scoped actions run — through a separate narrow-write path. Then the on-call is paged and a ticket opened over the MCP Gateway. If the anomaly budget trips, it hands off to a human.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="relative z-20 border-y border-line bg-surface px-6 py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Reveal className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
              <Icon icon="solar:routing-linear" />
              End-to-end flow
            </span>
          </Reveal>
          <MaskedText
            as="h2"
            text="Every step runs through the gateway."
            className="max-w-3xl justify-center text-3xl font-light tracking-tighter text-white md:text-5xl"
          />
          <Reveal
            as="p"
            delay={120}
            className="mt-6 max-w-xl text-lg leading-relaxed font-extralight text-zinc-400"
          >
            The failure handling is the product. A loop budget caps runaway
            cascades, and every step is recorded so a failure escalates with
            full context instead of losing it.
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.title}
              delay={i * 90}
              className="group flex flex-col bg-surface p-8 transition-colors duration-300 hover:bg-surface-2"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-5xl font-extralight text-line-2 transition-colors group-hover:text-accent-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon icon={step.icon} className="text-3xl text-accent-2" />
              </div>
              <h3 className="mb-3 text-xl font-light tracking-tight text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed font-extralight text-zinc-400">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
