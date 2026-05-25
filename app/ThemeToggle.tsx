"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DASHBOARD_PREFIXES = [
  "/user-dashboard",
  "/user-analytics",
  "/branding",
  "/admin",
  "/super-admin",
  "/analytics",
];

type ThemeMode = "light" | "dark";

function setThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem("theme", mode);
}

export function ThemeToggle() {
  const pathname = usePathname();
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    try {
      setThemeMode(mode);
    } catch {}
  }, [mode]);

  if (DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        type="button"
        aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
        onClick={() => {
          const next: ThemeMode = mode === "dark" ? "light" : "dark";
          setMode(next);
        }}
        className="glass-nav border border-surface-variant/30 shadow-xl shadow-black/10 rounded-full p-1 backdrop-blur-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
