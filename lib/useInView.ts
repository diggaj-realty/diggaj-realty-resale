"use client";

import { useEffect, useRef, useState } from "react";

/** Lightweight "reveal on scroll" trigger — a dependency-free stand-in for
 *  framer-motion's whileInView, for the many places that only need a single
 *  one-shot fade/slide-in and don't otherwise need framer-motion's JS. */
export function useInView<T extends HTMLElement>(amount = 0.6) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: amount }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return { ref, inView };
}
