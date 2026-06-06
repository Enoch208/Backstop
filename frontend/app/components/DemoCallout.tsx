import Link from "next/link";
import { Icon } from "@iconify/react";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";
import { GITHUB_URL } from "../lib/links";

export default function DemoCallout() {
  return (
    <section id="demo" className="relative z-20 bg-black px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Reveal className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
              <Icon icon="solar:play-circle-linear" />
              The demo
            </span>
          </Reveal>
          <MaskedText
            as="h2"
            text="Same alert. One acts on a lie."
            className="max-w-3xl justify-center text-3xl font-light tracking-tighter text-white md:text-5xl"
          />
          <Reveal
            as="p"
            delay={120}
            className="mt-6 max-w-2xl text-lg leading-relaxed font-extralight text-zinc-400"
          >
            We inject a plausible-but-wrong diagnosis — a hallucinated deploy SHA
            recommending{" "}
            <span className="font-mono text-accent-2">rollback(scope=all)</span>.
            Then we run two agents side by side.
          </Reveal>
        </div>

        {/* Side-by-side contrast */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line lg:grid-cols-2">
          {/* Naive */}
          <Reveal className="flex flex-col bg-surface p-10">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Icon icon="solar:close-circle-linear" className="text-xl" />
              </span>
              <span className="text-sm font-medium tracking-widest text-red-400 uppercase">
                Naive agent
              </span>
            </div>
            <p className="mb-6 text-lg font-light text-zinc-300">
              One model, every tool, no guardrails.
            </p>
            <ul className="flex flex-col gap-3 text-sm font-extralight text-zinc-400">
              <li className="flex gap-3">
                <Icon
                  icon="solar:arrow-right-linear"
                  className="mt-0.5 shrink-0 text-red-400/70"
                />
                Trusts the hallucinated SHA at face value.
              </li>
              <li className="flex gap-3">
                <Icon
                  icon="solar:arrow-right-linear"
                  className="mt-0.5 shrink-0 text-red-400/70"
                />
                Has the destructive tool — so it{" "}
                <span className="text-zinc-200">can</span> fire it.
              </li>
              <li className="flex gap-3">
                <Icon
                  icon="solar:arrow-right-linear"
                  className="mt-0.5 shrink-0 text-red-400/70"
                />
                Rolls back everything / restarts the DB → catastrophic.
              </li>
            </ul>
          </Reveal>

          {/* Hardened */}
          <Reveal delay={120} className="flex flex-col bg-[#0b1220] p-10">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-2">
                <Icon icon="solar:shield-check-linear" className="text-xl" />
              </span>
              <span className="text-sm font-medium tracking-widest text-accent-2 uppercase">
                Backstop
              </span>
            </div>
            <p className="mb-6 text-lg font-light text-white">
              Scoped tools, guardrails, quality gate.
            </p>
            <ul className="flex flex-col gap-3 text-sm font-extralight text-zinc-300">
              <li className="flex gap-3">
                <Icon
                  icon="solar:check-circle-linear"
                  className="mt-0.5 shrink-0 text-accent-2"
                />
                The destructive tool isn&apos;t even in its hands.
              </li>
              <li className="flex gap-3">
                <Icon
                  icon="solar:check-circle-linear"
                  className="mt-0.5 shrink-0 text-accent-2"
                />
                Quality gate flags the ungrounded SHA → re-routes.
              </li>
              <li className="flex gap-3">
                <Icon
                  icon="solar:check-circle-linear"
                  className="mt-0.5 shrink-0 text-accent-2"
                />
                A stronger model returns a correct, scoped, safe fix.
              </li>
            </ul>
          </Reveal>
        </div>

        {/* CTA panel (ported CTASection style) */}
        <Reveal className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line lg:grid-cols-3">
          <div className="flex flex-col justify-center bg-surface-2 p-12 md:p-16 lg:col-span-2">
            <div className="mb-10 flex h-16 w-16 items-center justify-center border border-line bg-surface text-accent-2 shadow-inner">
              <Icon icon="solar:code-square-linear" className="text-3xl" />
            </div>
            <h3 className="mb-6 text-3xl font-light tracking-tighter text-white md:text-4xl">
              Read the code. Break the sandbox.
            </h3>
            <p className="mb-12 max-w-xl text-lg leading-relaxed font-extralight text-zinc-400">
              The failure and the recovery are real — GitHub, Slack and Linear
              over the MCP gateway, infra actions on a live disposable sandbox.
              No theater.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/run"
                className="inline-flex items-center justify-center gap-2 bg-white px-10 py-4 text-sm font-medium text-black transition-all hover:bg-zinc-200 active:scale-95"
              >
                <Icon icon="solar:play-circle-linear" className="text-base" />
                Open the live console
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-line bg-surface px-10 py-4 text-sm font-medium text-zinc-300 transition-all hover:border-line-2 hover:text-white active:scale-95"
              >
                <Icon icon="simple-icons:github" className="text-base" />
                View on GitHub
              </a>
            </div>
          </div>

          <div className="group relative flex flex-col justify-between overflow-hidden bg-accent p-12 md:p-16">
            <div className="pointer-events-none absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
            <Icon
              icon="solar:shield-keyhole-linear"
              className="relative z-10 mb-12 text-6xl text-white/90"
            />
            <div className="relative z-10 mt-auto">
              <h4 className="mb-4 text-2xl font-light tracking-tight text-white">
                Built for the brief
              </h4>
              <p className="text-sm leading-relaxed font-extralight text-white/80">
                Every red and amber event maps to a TrueFoundry capability:
                gateway, scoped MCP, custom guardrails, observability.
              </p>
            </div>
            <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full border border-white/20 transition-transform duration-1000 ease-out group-hover:scale-110" />
            <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full border border-white/20 transition-transform duration-700 ease-out group-hover:scale-110" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
