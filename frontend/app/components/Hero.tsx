import Link from "next/link";
import { Icon } from "@iconify/react";
import HeroBackground from "./HeroBackground";
import MaskedText from "./MaskedText";
import Reveal from "./Reveal";
import { GITHUB_URL } from "../lib/links";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden"
    >
      <HeroBackground />

      {/* Radial vignette to seat the text over the bars */}
      <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_30%,#030303_78%)]" />

      <main className="relative z-10 mt-20 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <Reveal className="mb-8" delay={50}>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent-2">
            <Icon icon="solar:shield-keyhole-linear" />
            Resilient Agents · TrueFoundry × AWS Bedrock
          </span>
        </Reveal>

        <MaskedText
          as="h1"
          text="Fails safe, not just stays up."
          className="max-w-4xl justify-center text-5xl font-light tracking-tighter text-white md:text-7xl"
        />

        <Reveal
          as="p"
          delay={150}
          className="mt-8 max-w-2xl text-lg leading-relaxed font-extralight text-zinc-400 md:text-xl"
        >
          An on-call SRE agent that triages and remediates live incidents —
          engineered so a model that is{" "}
          <span className="text-white">up but wrong</span> can never turn a bad
          output into a destructive action.
        </Reveal>

        <Reveal
          delay={250}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 bg-white px-8 py-4 text-sm font-medium text-black transition-all hover:bg-zinc-200 active:scale-95 sm:w-auto"
          >
            <Icon icon="simple-icons:github" className="text-base" />
            View on GitHub
          </a>
          <Link
            href="/run"
            className="flex w-full items-center justify-center gap-2 border border-line bg-surface px-8 py-4 text-sm font-medium text-zinc-300 transition-all hover:border-line-2 hover:text-white active:scale-95 sm:w-auto"
          >
            <Icon icon="solar:play-circle-linear" className="text-base" />
            See it live
          </Link>
        </Reveal>
      </main>
    </section>
  );
}
