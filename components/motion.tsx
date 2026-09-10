"use client";

import { useEffect } from "react";

export function Motion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!preference.matches) entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    const stop = () => {
      if (preference.matches) {
        observer.disconnect();
        document
          .querySelectorAll(".is-revealed")
          .forEach((element) => element.classList.remove("is-revealed"));
      }
    };
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", stop);
    };
  }, []);
  return null;
}
