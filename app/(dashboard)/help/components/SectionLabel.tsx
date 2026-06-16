import { SECTION_LABEL_STYLE, HELP_COLORS } from "./helpTheme";

/** Uppercase eyebrow label used between Help page sections. */
export function SectionLabel({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <div style={SECTION_LABEL_STYLE}>
      {children}
      {count ? (
        <span
          style={{
            fontWeight: 600,
            letterSpacing: 0,
            textTransform: "none",
            color: HELP_COLORS.text3,
            fontSize: 12.5,
          }}
        >
          {count}
        </span>
      ) : null}
    </div>
  );
}
