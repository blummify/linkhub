"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HELP_ONBOARDING_STEPS } from "../../../constants/helpLinks";
import { BRANDING_FONT_SERIF } from "../../../constants/brandingFonts";
import { HELP_COLORS, CARD_STYLE } from "./helpTheme";
import { CheckIcon, ChevronRightIcon } from "./helpIcons";

/**
 * "Get started" checklist. Steps are togglable locally so the user can tick off
 * progress; the initial done-state comes from the content model. (Not yet wired
 * to real account state — presentational onboarding aid.)
 */
export function OnboardingChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(HELP_ONBOARDING_STEPS.map((s) => [s.id, !!s.done]))
  );

  const doneCount = useMemo(() => Object.values(done).filter(Boolean).length, [done]);
  const total = HELP_ONBOARDING_STEPS.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <section
      style={{ ...CARD_STYLE, borderRadius: 18, padding: "26px 28px", boxShadow: "0 1px 2px rgba(24,27,39,0.05)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: BRANDING_FONT_SERIF,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 25,
              color: HELP_COLORS.text,
            }}
          >
            Set up your Linkhub
          </div>
          <div style={{ fontSize: 14, color: HELP_COLORS.text2, marginTop: 2 }}>
            Four quick steps to a page worth sharing.
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: HELP_COLORS.text2, marginBottom: 7 }}>
            <b style={{ color: HELP_COLORS.accent }}>{doneCount}</b> of {total} complete
          </div>
          <div
            style={{
              width: 132,
              height: 7,
              borderRadius: 99,
              background: HELP_COLORS.accentSoft,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: HELP_COLORS.grad,
                borderRadius: 99,
                transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {HELP_ONBOARDING_STEPS.map((step) => {
          const isDone = !!done[step.id];
          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "13px 15px",
                border: `1px solid ${HELP_COLORS.border}`,
                borderRadius: 12,
                background: HELP_COLORS.surface,
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = HELP_COLORS.borderStrong;
                e.currentTarget.style.background = HELP_COLORS.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = HELP_COLORS.border;
                e.currentTarget.style.background = HELP_COLORS.surface;
              }}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                aria-label={`Mark "${step.title}" ${isDone ? "incomplete" : "complete"}`}
                onClick={() => setDone((d) => ({ ...d, [step.id]: !d[step.id] }))}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: `2px solid ${isDone ? HELP_COLORS.accent : HELP_COLORS.borderStrong}`,
                  background: isDone ? HELP_COLORS.accent : "transparent",
                  color: isDone ? "#fff" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  padding: 0,
                }}
              >
                <CheckIcon size={13} />
              </button>

              <Link
                href={step.href}
                style={{ display: "flex", flex: 1, minWidth: 0, alignItems: "center", gap: 13, textDecoration: "none" }}
              >
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 14.5,
                      color: isDone ? HELP_COLORS.text2 : HELP_COLORS.text,
                      textDecorationLine: isDone ? "line-through" : "none",
                      textDecorationColor: HELP_COLORS.text3,
                    }}
                  >
                    {step.title}
                  </span>
                  <span style={{ fontSize: 12.5, color: HELP_COLORS.text3 }}>{step.meta}</span>
                </span>
                <span style={{ marginLeft: "auto", color: HELP_COLORS.text3, display: "flex" }}>
                  <ChevronRightIcon size={16} />
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
