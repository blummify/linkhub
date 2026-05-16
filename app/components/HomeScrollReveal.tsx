"use client";

import { useEffect } from "react";

export function HomeScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll<HTMLElement>(".reveal-hidden");
    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return null;
}
