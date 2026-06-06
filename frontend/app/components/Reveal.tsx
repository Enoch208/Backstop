"use client";

import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms applied as a CSS transition-delay. */
  delay?: number;
  as?: React.ElementType;
};

/**
 * Reveal-on-scroll wrapper — replaces the reference template's `.reveal-element`
 * CSS class. Fades + lifts its children into view the first time they intersect.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion: `visible` is already true via `reduced`, no observer needed.
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  const visible = shown || reduced;

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
