"use client";

import { useState } from "react";
import {
  CURRENCIES,
  formatPrice,
  type CurrencyCode,
} from "@/lib/currencies";
import { CurrencySelector } from "@/app/components/CurrencySelector";

const STORAGE_KEY = "lh_currency";

const filledIconStyle = {
  fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
};

const PLANS = [
  {
    tier: "Starter",
    name: "Free",
    ghsAmount: 0,
    per: "/month",
    desc: "Perfect for hobbyists and personal profiles.",
    features: [
      { label: "Basic link management", icon: "check_circle", active: true },
      { label: "1 digital hub",          icon: "check_circle", active: true },
      { label: "Community support",      icon: "check_circle", active: true },
      { label: "Custom branding",        icon: "cancel",       active: false },
    ],
    cta: "Start Free",
    ctaStyle: "plain" as const,
    highlight: false,
  },
  {
    tier: "Creator",
    name: "Hub",
    ghsAmount: 10,
    per: "/month",
    desc: "The editorial standard for professional creators.",
    features: [
      { label: "Unlimited links & hubs",   icon: "stars",        active: true },
      { label: "Advanced analytics",        icon: "check_circle", active: true },
      { label: "Custom branding & fonts",   icon: "check_circle", active: true },
      { label: "Priority support",          icon: "check_circle", active: true },
    ],
    cta: "Upgrade to Hub",
    ctaStyle: "primary" as const,
    highlight: true,
  },
  {
    tier: "Scale",
    name: "Studio",
    ghsAmount: 20,
    per: "/month",
    desc: "Bespoke solutions for teams and agencies.",
    features: [
      { label: "Multiple team seats",        icon: "check_circle", active: true },
      { label: "Custom domains",             icon: "check_circle", active: true },
      { label: "Dedicated account manager",  icon: "check_circle", active: true },
      { label: "SLA & security audits",      icon: "check_circle", active: true },
    ],
    cta: "Upgrade to Studio",
    ctaStyle: "plain" as const,
    highlight: false,
  },
] as const;

interface Props {
  defaultCurrency: CurrencyCode;
}

export function PricingPlansSection({ defaultCurrency }: Props) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return defaultCurrency;
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    return saved && saved in CURRENCIES ? saved : defaultCurrency;
  });

  function handleChange(code: CurrencyCode) {
    setCurrency(code);
    localStorage.setItem(STORAGE_KEY, code);
  }

  const curr = CURRENCIES[currency];
  const showDisclaimer = currency !== "GHS";

  return (
    <>
      {/* Currency toggle */}
      <div className="flex justify-center mb-8 gap-3 items-center">
        <span className="text-sm text-on-surface-variant">Show prices in</span>
        <CurrencySelector
          value={currency}
          onChange={handleChange}
          className="text-on-surface border-outline-variant"
        />
      </div>

      {showDisclaimer && (
        <p className="text-center text-xs text-on-surface-variant mb-6 opacity-70">
          Approximate prices shown in {curr.name}. You&apos;ll be billed in GHS at checkout.
        </p>
      )}

      {/* Plan cards */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-32">
        {PLANS.map((plan) => {
          const priceStr = plan.ghsAmount === 0
            ? formatPrice(0, curr)
            : formatPrice(plan.ghsAmount, curr);

          return (
            <div
              key={plan.name}
              className={
                plan.highlight
                  ? "relative bg-surface-container-lowest rounded-xl p-8 flex flex-col h-full ring-2 ring-primary/20 shadow-2xl scale-105 z-10"
                  : "bg-surface-container-low rounded-xl p-8 flex flex-col h-full border-t-4 border-transparent"
              }
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <span className={`font-label text-xs uppercase tracking-widest font-semibold ${plan.highlight ? "text-primary" : "text-on-surface-variant"}`}>
                  {plan.tier}
                </span>
                <h3 className="font-headline font-bold text-3xl mt-2">{plan.name}</h3>
                <p className="text-on-surface-variant mt-2 text-sm">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold">{priceStr}</span>
                <span className="text-on-surface-variant">{plan.per}</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={`flex items-center gap-3 text-sm ${!f.active ? "text-on-surface-variant opacity-50" : ""}`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg ${f.active ? "text-secondary" : ""}`}
                      style={f.active ? filledIconStyle : undefined}
                    >
                      {f.icon}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <button
                className={
                  plan.ctaStyle === "primary"
                    ? "w-full py-4 rounded-full font-semibold text-on-primary editorial-gradient hover:opacity-90 transition-all active:scale-95"
                    : plan.name === "Free"
                    ? "w-full py-4 rounded-full font-semibold text-primary bg-surface-container-lowest hover:bg-surface-bright transition-colors"
                    : "w-full py-4 rounded-full font-semibold text-on-surface-variant bg-surface-container-highest hover:bg-surface-dim transition-colors"
                }
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </section>
    </>
  );
}
