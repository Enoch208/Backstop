import { Icon } from "@iconify/react";
import Wordmark from "./Wordmark";
import { GITHUB_URL } from "../lib/links";

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-line/50 bg-background px-6 pt-20 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-16 md:flex-row md:gap-8">
        <div className="flex max-w-sm flex-col items-start">
          <Wordmark className="mb-6" />
          <p className="mb-8 text-sm leading-relaxed font-extralight text-zinc-500">
            An on-call SRE incident agent that fails safe, not just stays up.
            Built for the Resilient Agents hackathon on TrueFoundry × AWS
            Bedrock.
          </p>
          <div className="flex items-center gap-4 text-zinc-500">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-white"
            >
              <Icon icon="simple-icons:github" width={20} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="transition-colors hover:text-white"
            >
              <Icon icon="simple-icons:x" width={20} />
            </a>
          </div>
        </div>

        <nav className="flex flex-wrap gap-16 sm:gap-24">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium tracking-wide text-white">
              Product
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-extralight text-zinc-500">
              <li>
                <a href="#problem" className="transition-colors hover:text-white">
                  The problem
                </a>
              </li>
              <li>
                <a href="#safety" className="transition-colors hover:text-white">
                  Safety layer
                </a>
              </li>
              <li>
                <a href="#how" className="transition-colors hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <a href="#demo" className="transition-colors hover:text-white">
                  Demo
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-medium tracking-wide text-white">
              Built on
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-extralight text-zinc-500">
              <li>TrueFoundry AI Gateway</li>
              <li>MCP Gateway</li>
              <li>Custom Guardrails</li>
              <li>AWS Bedrock</li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-line/50 pt-8 sm:flex-row">
        <p className="text-xs text-zinc-600">
          © 2026 Backstop. Built for the Resilient Agents hackathon.
        </p>
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Fails safe by design
        </div>
      </div>
    </footer>
  );
}
