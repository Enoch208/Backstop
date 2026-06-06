"use client";

import { useEffect, useMemo, useRef } from "react";

const NUM_BARS = 23;

/**
 * Breathing gradient step-bars behind the hero (ported from the reference).
 * Uses direct DOM mutation in a rAF loop for a smooth continuous wave.
 */
export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerIndex = Math.floor(NUM_BARS / 2);

  const barsData = useMemo(
    () =>
      Array.from({ length: NUM_BARS }).map((_, i) => {
        const dist = Math.abs(i - centerIndex);
        const normDist = dist / centerIndex;
        return { index: i, baseHeight: 22 + Math.pow(normDist, 1.4) * 68 };
      }),
    [centerIndex],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bars = Array.from(container.children) as HTMLElement[];
    const start = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const time = (now - start) * 0.001;
      bars.forEach((el, i) => {
        const data = barsData[i];
        if (!data) return;
        const wave = Math.sin(time * 1.2 + data.index * 0.25) * 2;
        el.style.height = `${data.baseHeight + wave}%`;
        const pulse = Math.sin(time * 1.5 + data.index * 0.15) * 0.05;
        el.style.opacity = (0.9 + pulse).toFixed(2);
      });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [barsData]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 flex items-end justify-center gap-0 px-2 md:px-8"
      style={{
        maskImage:
          "linear-gradient(180deg, transparent, black 0%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent, black 0%, black 85%, transparent)",
      }}
    >
      {barsData.map((bar) => (
        <div
          key={bar.index}
          className="step-bar h-full w-full flex-1"
          style={{ height: `${bar.baseHeight}%`, opacity: 0.9 }}
        />
      ))}
    </div>
  );
}
