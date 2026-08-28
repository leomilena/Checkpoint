"use client";

import { useEffect, useState } from "react";

const STEPS = ["0.9375rem", "1.0625rem", "1.1875rem", "1.3125rem"];
const STORAGE_KEY = "cp-text-size";

export function TextSizeControl() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    const initial = Number.isInteger(stored) && stored >= 0 && stored < STEPS.length ? stored : 1;
    setStep(initial);
    apply(initial);
  }, []);

  function apply(next: number) {
    document.documentElement.style.setProperty("--cp-article-font-size", STEPS[next]);
  }

  function change(delta: number) {
    setStep((prev) => {
      const next = Math.min(STEPS.length - 1, Math.max(0, prev + delta));
      apply(next);
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface2 p-1">
      <button
        type="button"
        onClick={() => change(-1)}
        disabled={step === 0}
        aria-label="Reducir tamaño del texto"
        className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold text-text transition hover:text-accent disabled:opacity-40"
      >
        A-
      </button>
      <button
        type="button"
        onClick={() => change(1)}
        disabled={step === STEPS.length - 1}
        aria-label="Aumentar tamaño del texto"
        className="flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold text-text transition hover:text-accent disabled:opacity-40"
      >
        A+
      </button>
    </div>
  );
}
