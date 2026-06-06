"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Wordmark from "./Wordmark";
import { GITHUB_URL } from "../lib/links";

const NAV_LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Safety", href: "#safety" },
  { label: "How it works", href: "#how" },
  { label: "Demo", href: "#demo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  // Condense the bar once the user leaves the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section currently in the middle of the viewport.
  useEffect(() => {
    const sections = NAV_LINKS.map((l) =>
      document.getElementById(l.href.slice(1)),
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex w-full justify-center px-4 pt-4 md:pt-6">
      <nav
        className={`relative flex w-full items-center justify-between rounded-full border backdrop-blur-xl transition-all duration-500 ease-out ${
          scrolled
            ? "max-w-3xl border-white/12 bg-zinc-950/80 py-2 pr-2 pl-5 shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.07)]"
            : "max-w-4xl border-white/10 bg-zinc-900/60 py-2.5 pr-2.5 pl-6 shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        }`}
      >
        <a
          href="#top"
          className="transition-transform active:scale-95"
          aria-label="Backstop home"
        >
          <Wordmark size={scrolled ? 27 : 30} />
        </a>

        {/* Equal flex spacers on each side keep the links optically centered in
            the space between the logo and the (wider) CTA. */}
        <div className="hidden flex-1 md:block" />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-white/8 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="hidden flex-1 md:block" />

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_2px_10px_rgba(255,255,255,0.12)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_2px_16px_rgba(255,255,255,0.22)] active:scale-95"
        >
          <Icon icon="simple-icons:github" className="text-[15px]" />
          <span className="hidden sm:inline">View on GitHub</span>
        </a>
      </nav>
    </header>
  );
}
