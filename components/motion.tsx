"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { Bow } from "./brand-mark";
import "./motion.css";

const MOTION_EVENT = "haunted-tips:motion-preference";
const MOTION_STORAGE = "haunted-tips:decorative-motion";
const revealSelector = [
  "[data-reveal]", ".product-card", ".hero-copy > h1", ".hero-copy > p",
  ".hero-copy > a", ".shop-intro", ".product-layout > *",
  ".product-related__heading", ".source-reviews__heading", ".source-reviews__empty",
  ".editorial-page__head", ".editorial-page__body > h2", ".editorial-page__note",
].join(", ");

function isPaused() {
  return document.documentElement.dataset.decorativeMotion === "paused";
}
function subscribeToMotion(callback: () => void) {
  window.addEventListener(MOTION_EVENT, callback);
  return () => window.removeEventListener(MOTION_EVENT, callback);
}
function setPaused(paused: boolean) {
  const value = paused ? "paused" : "running";
  document.documentElement.dataset.decorativeMotion = value;
  try { sessionStorage.setItem(MOTION_STORAGE, value); } catch { /* Private browsing can disable storage. */ }
  window.dispatchEvent(new Event(MOTION_EVENT));
}

export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let savedPause = isPaused();
    try { savedPause = sessionStorage.getItem(MOTION_STORAGE) === "paused"; } catch { /* Keep the current page preference. */ }
    setPaused(savedPause);
    if (!("IntersectionObserver" in window)) return;
    const registered = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!preference.matches && !isPaused()) entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    const register = () => document.querySelectorAll<HTMLElement>(revealSelector)
      .forEach((element) => {
        if (registered.has(element)) return;
        registered.add(element);
        const siblings = Array.from(element.parentElement?.children || [])
          .filter(sibling => sibling.matches(revealSelector));
        element.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(element), 3) * 70}ms`);
        observer.observe(element);
      });
    register();
    // Filtering the catalog mounts fresh cards without changing the pathname.
    const mutations = new MutationObserver(register);
    const content = document.getElementById("main-content");
    if (content) mutations.observe(content, { childList: true, subtree: true });
    const stop = () => {
      if (preference.matches || isPaused()) {
        document
          .querySelectorAll(".is-revealed")
          .forEach((element) => element.classList.remove("is-revealed"));
      }
    };
    preference.addEventListener("change", stop);
    window.addEventListener(MOTION_EVENT, stop);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", stop);
      window.removeEventListener(MOTION_EVENT, stop);
    };
  }, [pathname]);
  return null;
}

export function MoodRibbon() {
  const paused = useSyncExternalStore(subscribeToMotion, isPaused, () => false);
  const toggle = () => setPaused(!paused);
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
