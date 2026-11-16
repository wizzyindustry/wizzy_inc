'use client';

import { useEffect, useRef, useState } from 'react';
import { splitNumber } from '@/lib/utils/split-number';

const DURATION_MS = 1400;

/**
 * Counts up from 0 to the number when it scrolls into view. The real value is in the HTML
 * from the start (no JavaScript, search engines, screen readers) — only the animation is
 * added in the browser, and skipped with "reduce motion".
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const parts = splitNumber(value);
    const el = ref.current;
    if (!parts || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS);
        const eased = 1 - (1 - progress) ** 3;
        const current = (parts.number * eased).toFixed(parts.decimals);
        setShown(`${parts.before}${current}${parts.after}`);
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
