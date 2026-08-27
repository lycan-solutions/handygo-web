"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type TourStep = {
  /** Path under /public. */
  image: string;
  /** Alt text describing the screen, not the step. */
  alt: string;
  title: string;
  /** Exactly three short lines — the point of the section is teaching, not reading. */
  lines: [string, string, string];
};

const ADVANCE_MS = 7000;

/**
 * Four app screens with three lines each, advancing on their own.
 *
 * Everything here is presentation: the screens are static images exported from
 * the prototype, so there is no data, no API and nothing to get out of sync.
 */
export default function StepTour({ steps }: { steps: readonly TourStep[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (i: number) => setActive((i + steps.length) % steps.length),
    [steps.length],
  );

  useEffect(() => {
    if (paused) return;
    // Someone who has asked for less motion should not have the panel moving
    // underneath them; they still get every step through the buttons.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const t = setTimeout(() => go(active + 1), ADVANCE_MS);
    return () => clearTimeout(t);
  }, [active, paused, go]);

  const step = steps[active];

  return (
    <div
      className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12 lg:items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1));
      }}
    >
      {/* The screen. Every step is rendered and only one is shown, so switching
          never waits on a network request. */}
      <div className="relative mx-auto w-full max-w-[280px] lg:max-w-none">
        <div
          className="relative overflow-hidden rounded-[2rem] border shadow-lg"
          style={{ borderColor: "var(--border)", aspectRatio: "700 / 1452" }}
        >
          {steps.map((s, i) => (
            <Image
              key={s.image}
              src={s.image}
              alt={s.alt}
              fill
              sizes="(max-width: 1024px) 280px, 320px"
              priority={i === 0}
              className="object-cover transition-opacity duration-500"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
        </div>
      </div>

      <div>
        <p
          className="text-xs font-bold tracking-widest uppercase mb-2"
          style={{ color: "var(--brand)" }}
        >
          Step {active + 1} of {steps.length}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-5">
          {step.title}
        </h2>

        <ul className="space-y-3 mb-8">
          {step.lines.map((line) => (
            <li key={line} className="flex gap-3 text-zinc-700 leading-7">
              <span
                aria-hidden
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--brand)" }}
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* Tabs double as the progress indicator: the filled bar is the step
            you are on, so there is no separate dot row to read. */}
        <div className="flex gap-2" role="tablist" aria-label="Booking steps">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Step ${i + 1}: ${s.title}`}
              onClick={() => go(i)}
              className="group flex-1 cursor-pointer pt-3 pb-1 text-left"
            >
              <span
                className="block h-1 rounded-full transition-colors"
                style={{
                  background:
                    i === active ? "var(--brand)" : "var(--surface-subtle)",
                }}
              />
              <span
                className="mt-2 block text-xs font-semibold transition-colors"
                style={{
                  color: i === active ? "var(--brand)" : "var(--text-secondary)",
                }}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
