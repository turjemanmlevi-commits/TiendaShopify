"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { Bow } from "./brand-mark";
import "./motion.css";

export function Motion() {
  const pathname = usePathname();
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
      .querySelectorAll<HTMLElement>("[data-reveal], .product-card")
      .forEach((element, index) => {
        if (element.classList.contains("product-card")) {
          element.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
        }
        observer.observe(element);
      });
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
  }, [pathname]);
  return null;
}

export function MoodRibbon() {
  const [paused, setPaused] = useState(false);
  useEffect(() => () => {
    delete document.documentElement.dataset.decorativeMotion;
  }, []);
  const toggle = () => {
    const nextPaused = !paused;
    setPaused(nextPaused);
    document.documentElement.dataset.decorativeMotion = nextPaused ? "paused" : "running";
  };
  return (
    <div className="mood-ribbon mood-ribbon--animated">
      <div className="ribbon-viewport" aria-hidden="true">
        <div className="ribbon-track">
          {[0, 1].map((copy) => (
            <div className="ribbon-group" key={copy}>
              <span>A little romance</span><Bow />
              <span>A little pumpkin spice</span><span className="ribbon-star">✧</span>
              <span>A little mischief</span><Bow />
              <span>Scary cute, always</span><span className="ribbon-star">✧</span>
              <span>Haunted Tips</span><Bow />
            </div>
          ))}
        </div>
      </div>
      <button className="ribbon-toggle" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Play decorative animations" : "Pause decorative animations"} title={paused ? "Play decorative animations" : "Pause decorative animations"}>
        {paused ? <Play size={13} /> : <Pause size={13} />}
        <span>{paused ? "Play" : "Pause"}</span>
      </button>
    </div>
  );
}
