import Link from "next/link";
import { HELP_TOPICS } from "../../constants/helpLinks";
import { HELP_COLORS, CARD_STYLE } from "./helpTheme";
import { HelpIcon } from "./helpIcons";

/** "Browse by topic" — a responsive grid of category cards. */
export function TopicGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {HELP_TOPICS.map((topic) => (
        <Link
          key={topic.id}
          href={topic.href}
          style={{
            ...CARD_STYLE,
            padding: 20,
            textDecoration: "none",
            display: "block",
            transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(24,27,39,0.07), 0 1px 3px rgba(24,27,39,0.04)";
            e.currentTarget.style.borderColor = HELP_COLORS.borderStrong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = HELP_COLORS.border;
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: HELP_COLORS.accentSoft,
              color: HELP_COLORS.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <HelpIcon name={topic.icon} size={21} />
          </div>
          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: HELP_COLORS.text, marginBottom: 4 }}>
            {topic.title}
          </h3>
          <p style={{ fontSize: 13.5, color: HELP_COLORS.text2, lineHeight: 1.5 }}>
            {topic.description}
          </p>
          <div style={{ fontSize: 12.5, color: HELP_COLORS.text3, fontWeight: 500, marginTop: 10 }}>
            {topic.count}
          </div>
        </Link>
      ))}
    </section>
  );
}
