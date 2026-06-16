import { BRANDING_FONT_SERIF } from "../../../constants/brandingFonts";
import { HELP_POPULAR_TERMS } from "../../../constants/helpLinks";
import { HELP_COLORS } from "./helpTheme";

/** Hero heading + popular-search chips. Chips push a term into the shared search. */
export function HelpHero({ onPickTerm }: { onPickTerm: (term: string) => void }) {
  return (
    <section style={{ marginBottom: 8 }}>
      <h1
        style={{
          fontFamily: BRANDING_FONT_SERIF,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 52,
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: HELP_COLORS.text,
        }}
      >
        How can we <em style={{ color: HELP_COLORS.accent, fontStyle: "italic" }}>help?</em>
      </h1>
      <p style={{ color: HELP_COLORS.text2, fontSize: 17, marginTop: 10, maxWidth: 540 }}>
        Guides, shortcuts, and support for your Linkhub workspace.
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 24,
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: HELP_COLORS.text3, marginRight: 2 }}>Popular:</span>
        {HELP_POPULAR_TERMS.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onPickTerm(term)}
            style={{
              border: `1px solid ${HELP_COLORS.border}`,
              background: HELP_COLORS.surface,
              color: HELP_COLORS.text2,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 500,
              padding: "6px 13px",
              borderRadius: 999,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = HELP_COLORS.accent;
              e.currentTarget.style.color = HELP_COLORS.accent;
              e.currentTarget.style.background = HELP_COLORS.accentSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = HELP_COLORS.border;
              e.currentTarget.style.color = HELP_COLORS.text2;
              e.currentTarget.style.background = HELP_COLORS.surface;
            }}
          >
            {term}
          </button>
        ))}
      </div>
    </section>
  );
}
