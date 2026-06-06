"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type MaskedTextProps = {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
};

/**
 * Word-by-word mask reveal on scroll (ported from the reference template).
 * Each word slides up from behind a clipping mask as the element enters view.
 */
export default function MaskedText({
  text,
  className = "",
  delay = 0,
  as: Tag = "div",
}: MaskedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll(".masked-word");
      gsap.fromTo(
        words,
        { y: "120%" },
        {
          y: "0%",
          duration: 1.2,
          stagger: 0.05,
          delay,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, reduced]);

  return (
    <Tag
      ref={ref}
      className={`flex flex-wrap gap-x-[0.25em] gap-y-[0.1em] ${className}`}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-flex overflow-hidden">
          <span className="masked-word inline-block origin-bottom-left pb-1 will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
