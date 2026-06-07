import { Icon } from "@iconify/react";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";

const FEATURES = [
  {
    icon: "solar:hand-stars-linear",
    title: "The hands are removed",
    description:
      "Destructive tools are never in the agent's toolset, and the action gate blocks any that slip through. It physically cannot take down prod, even on a hallucination.",
    badge: "Scoped tools",
  },
  {
    icon: "solar:check-read-linear",
    title: "Quality gate",
    description:
      "A custom guardrail validates every diagnosis for groundedness: do the suspected resource and deploy SHA actually exist in the gathered signals? Ungrounded → re-route to a stronger model.",
    badge: "Output guardrail",
  },
  {
    icon: "solar:shield-warning-linear",
    title: "Action-validation gate",
    description:
      "Before any write executes, proposed tool args are checked against policy — blast radius, protected resources, and whether the action even matches the evidence.",
    badge: "Pre-execution",
  },
  {
    icon: "solar:bolt-circle-linear",
    title: "Cascade circuit breaker",
    description:
      "A running anomaly budget across steps. Trip the breaker and escalate to a human instead of amplifying a cascading failure.",
    badge: "Resilience",
  },
  {
    icon: "solar:routing-2-linear",
    title: "Priority fallback chain",
    description:
      "Claude → Llama → Nova → Haiku, with retries, latency routing, and 5-minute cooldowns on unhealthy targets. Stays up through rate limits and outages.",
    badge: "AI Gateway",
  },
  {
    icon: "solar:document-text-linear",
    title: "Full audit trail",
    description:
      "Every fallback, every blocked action, every guardrail hit and its cost — on the record. The receipts you show on screen.",
    badge: "Observability",
  },
];

export default function Features() {
  return (
    <section id="safety" className="relative z-20 flex flex-col bg-black">
      <div className="flex w-full flex-col items-center border-b border-line px-6 pt-28 pb-20 text-center">
        <Reveal className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
            <Icon icon="solar:layers-minimalistic-linear" />
            The safety layer
          </span>
        </Reveal>
        <MaskedText
          as="h2"
          text="Resilience at every layer."
          className="max-w-2xl justify-center text-3xl font-light tracking-tighter text-white md:text-5xl"
        />
        <Reveal
          as="p"
          delay={120}
          className="mt-6 max-w-xl text-lg leading-relaxed font-extralight text-zinc-400"
        >
          Six controls that turn a powerful agent into one you can hand the keys
          to — built on TrueFoundry&apos;s gateway and guardrails, hardened with
          in-agent logic.
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal
            key={feature.title}
            delay={(i % 3) * 80}
            className="group flex flex-col bg-black p-10 transition-colors duration-300 hover:bg-surface"
          >
            <div className="mb-8 flex h-16 w-16 items-center justify-center border border-line bg-surface text-accent-2 transition-colors duration-300 group-hover:border-accent/40 group-hover:text-accent-2">
              <Icon icon={feature.icon} className="text-4xl" />
            </div>
            <span className="mb-3 text-xs font-medium tracking-widest text-zinc-600 uppercase">
              {feature.badge}
            </span>
            <h3 className="mb-3 text-xl font-light tracking-tight text-white">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed font-extralight text-zinc-400">
              {feature.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
