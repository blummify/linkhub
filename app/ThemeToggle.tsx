"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function setThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem("theme", mode);
}

function getInitialThemeMode(): ThemeMode {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    try {
      return getInitialThemeMode();
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setThemeMode(mode);
    } catch {}
  }, [mode]);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        type="button"
        aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
        onClick={() => {
          const next: ThemeMode = mode === "dark" ? "light" : "dark";
          setMode(next);
        }}
        className="glass-nav border border-surface-variant/30 shadow-xl shadow-black/10 rounded-full p-1 backdrop-blur-xl transition-transform hover:scale-105 active:scale-95"
      >
        <span className="sr-only">Theme</span>
        <span className="flex items-center gap-1 p-1 rounded-full bg-surface-container-lowest">
          <span
            className={`material-symbols-outlined text-[18px] transition-all ${
              mode === "light" ? "text-primary" : "text-on-surface-variant opacity-60"
            }`}
          >
            light_mode
          </span>
          <span
            className={`material-symbols-outlined text-[18px] transition-all ${
              mode === "dark" ? "text-primary" : "text-on-surface-variant opacity-60"
            }`}
          >
            dark_mode
          </span>
        </span>
      </button>
    </div>
  );
}
