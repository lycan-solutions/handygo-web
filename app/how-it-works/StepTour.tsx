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

/**
 * Four app screens in one phone that stays put while the steps scroll past it.
 *
 * Everything here is presentation: the screens are static images exported from
 * the prototype, so there is no data, no API and nothing to get out of sync.
 * The phone is `position: sticky`, which needs no scroll listener of its own —
 * only the "which step am I on" question does.
 */
export default function StepTour({ steps }: { steps: readonly TourStep[] }) {
  const [active, setActive] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => {
    const el = stepsRef.current?.children[i];
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  useEffect(() => {
    const node = stepsRef.current;
    if (!node) return;

    // The step whose middle sits closest to the middle of the viewport wins,
    // so the phone never shows a screen nobody is reading. Cheaper and steadier
    // than IntersectionObserver thresholds when the blocks are taller than the
    // viewport.
    let queued = false;
    const pick = () => {
      queued = false;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(node.children).forEach((child, i) => {
        const r = child.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      setActive(best);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16 lg:items-start">
      {/* The phone, and under it a meter that doubles as the step picker. */}
      {/* Sticky only from lg up. On a phone-sized screen the mock is nearly as
          wide as the viewport, so pinning it would leave the step text
          scrolling out from behind it — there the phone simply sits at the top
          and the tabs below it do the switching. */}
      <div className="mx-auto w-full max-w-[15rem] lg:sticky lg:top-[max(1rem,calc(50vh-21rem))] lg:max-w-none">
        <div
          className="relative rounded-[2.25rem] p-2 shadow-xl"
          style={{
            background: "linear-gradient(160deg, #243c39, var(--brand-dark))",
            aspectRatio: "700 / 1452",
          }}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-2 z-10 h-2 w-[28%] -translate-x-1/2 rounded-full"
            style={{ background: "rgb(12 36 34 / 85%)" }}
          />
          {/* Every screen is rendered and only one is shown, so switching never
              waits on a network request. */}
          <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-white">
            {steps.map((s, i) => (
              <Image
                key={s.image}
                src={s.image}
                alt={s.alt}
                fill
                sizes="(max-width: 1024px) 240px, 304px"
                priority={i === 0}
                className="object-cover transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
                style={
                  i === active
                    ? { opacity: 1 }
                    : { opacity: 0, transform: "translateY(1.5rem) scale(0.985)" }
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-1.5" role="tablist" aria-label="Booking steps">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Step ${i + 1}: ${s.title}`}
              onClick={() => go(i)}
              className="h-[3px] flex-1 cursor-pointer rounded-full border-0 p-0 transition-colors"
              style={{
                background: i <= active ? "var(--brand)" : "var(--surface-subtle)",
              }}
            />
          ))}
        </div>
        <p
          className="mt-2.5 text-xs font-semibold tabular-nums tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          Step {String(active + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
        </p>
      </div>

      <div ref={stepsRef} className="flex flex-col">
        {steps.map(({ title, lines }, i) => {
          const live = i === active;
          return (
            <div
              key={title}
              className="flex flex-col justify-center py-12 lg:min-h-[72vh]"
            >
              <span
                className="mb-2 block text-xs font-bold tabular-nums tracking-widest transition-colors"
                style={{ color: live ? "var(--brand)" : "var(--text-secondary)" }}
              >
                {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              <h2 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">
                {title}
              </h2>
              <ul className="mt-4 grid max-w-xl gap-2.5">
                {lines.map((line, n) => (
                  <li
                    key={line}
                    className="flex gap-3.5 leading-7 text-zinc-600 transition-[opacity,transform] duration-500 motion-reduce:transition-none"
                    style={
                      live
                        ? { opacity: 1, transitionDelay: `${n * 70}ms` }
                        : { opacity: 0.4, transform: "translateY(0.35rem)" }
                    }
                  >
                    <span
                      aria-hidden
                      className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                      style={{
                        background: live ? "var(--brand)" : "var(--control-border)",
                      }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
