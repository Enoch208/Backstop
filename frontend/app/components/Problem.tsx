import { Icon } from "@iconify/react";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";

export default function Problem() {
  return (
    <section
      id="problem"
      className="relative z-20 border-y border-line bg-black px-6 py-28"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <Reveal className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
            <Icon icon="solar:danger-triangle-linear" />
            The real failure mode
          </span>
        </Reveal>

        <MaskedText
          as="h2"
          text="Everyone asks what happens when the model goes down."
          className="max-w-3xl justify-center text-3xl font-light tracking-tighter text-zinc-500 md:text-5xl"
        />
        <MaskedText
          as="h2"
          text="Backstop answers the scarier one."
          className="mt-3 max-w-3xl justify-center text-3xl font-light tracking-tighter text-white md:text-5xl"
          delay={0.15}
        />

        <Reveal
          as="p"
          delay={150}
          className="mt-8 max-w-2xl text-lg leading-relaxed font-extralight text-zinc-400"
        >
          What happens when the model is{" "}
          <span className="text-white">up but wrong</span> — and the agent is
          about to act on it? A hallucinated deploy SHA. A rollback scoped to{" "}
          <span className="font-mono text-accent-2">all</span>. A restart aimed
          at the prod database. The smartest model on earth still does this.
          Backstop is the layer that catches it before it acts.
        </Reveal>

        <div className="mt-16 grid w-full grid-cols-1 gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
          <div className="flex flex-col gap-3 bg-surface p-10 text-left">
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon icon="solar:server-2-broken" className="text-xl" />
              <span className="text-xs font-medium tracking-widest uppercase">
                Stay-up resilience
              </span>
            </div>
            <p className="text-lg font-light text-zinc-300">
              Fallback chains and retries keep the agent{" "}
              <span className="text-white">online</span>.
            </p>
            <p className="text-sm font-extralight text-zinc-500">
              Table stakes — every gateway sells it.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-[#0b1220] p-10 text-left">
            <div className="flex items-center gap-2 text-accent-2">
              <Icon icon="solar:shield-check-linear" className="text-xl" />
              <span className="text-xs font-medium tracking-widest uppercase">
                Fail-safe resilience
              </span>
            </div>
            <p className="text-lg font-light text-white">
              Guardrails keep the agent from doing the{" "}
              <span className="text-accent-2">catastrophic thing</span>.
            </p>
            <p className="text-sm font-extralight text-zinc-400">
              The differentiator — and the customer story.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
