'use client';

import { useEffect } from 'react';

/** What fades in: every section of the page content, plus anything marked data-reveal. */
const SELECTOR = 'main section:not([data-no-reveal]), main [data-reveal]';

/**
 * Fade-in animations as parts of the page scroll into view. Without JavaScript, or with
 * "reduce motion" switched on, everything is simply shown (see `.reveal-ready` in
 * globals.css): the page is never hidden waiting for an animation.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const root = document.documentElement;

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          seen.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    const watch = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (!el.classList.contains('is-visible')) seen.observe(el);
      });
    };
    // What is already on screen stays shown (no blink when the animations switch on).
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
    });
    watch();
    root.classList.add('reveal-ready');

    // New page content (moving to another page, or parts that appear later).
    const changes = new MutationObserver(watch);
    const main = document.getElementById('main');
    if (main) changes.observe(main, { childList: true, subtree: true });

    return () => {
      seen.disconnect();
      changes.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
