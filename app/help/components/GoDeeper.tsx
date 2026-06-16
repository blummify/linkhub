import Link from "next/link";
import {
  HELP_DOC_LINKS,
  HELP_CONTACT_CHANNELS,
  type DocLink,
  type ContactChannel,
} from "../../constants/helpLinks";
import { HELP_COLORS, CARD_STYLE } from "./helpTheme";
import { HelpIcon, ExternalIcon } from "./helpIcons";

/** Renders a `next/link` for internal hrefs and an `<a>` for external/mailto. */
function MaybeLink({
  href,
  external,
  children,
  ...rest
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  if (external) {
    return (
      <a
        href={href}
        target={href.startsWith("mailto") ? undefined : "_blank"}
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

function DocRow({ doc }: { doc: DocLink }) {
  return (
    <MaybeLink
      href={doc.href}
      external={doc.external}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "13px 14px",
        borderRadius: 11,
        textDecoration: "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.background = HELP_COLORS.surfaceHover;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: HELP_COLORS.surface2,
          color: HELP_COLORS.text2,
          border: `1px solid ${HELP_COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <HelpIcon name={doc.icon} size={18} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: HELP_COLORS.text }}>
          {doc.title}
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: HELP_COLORS.text3 }}>
          {doc.description}
        </span>
      </span>
      <span style={{ color: HELP_COLORS.text3, flexShrink: 0, display: "flex" }}>
        <ExternalIcon size={16} />
      </span>
    </MaybeLink>
  );
}

function ContactRow({ channel }: { channel: ContactChannel }) {
  return (
    <MaybeLink
      href={channel.href}
      external={channel.external}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${HELP_COLORS.border}`,
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = HELP_COLORS.accent;
        e.currentTarget.style.background = HELP_COLORS.accentSoft;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = HELP_COLORS.border;
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: HELP_COLORS.grad,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <HelpIcon name={channel.icon} size={19} />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: HELP_COLORS.text }}>
          {channel.title}
        </span>
        <span style={{ display: "block", fontSize: 13, color: HELP_COLORS.text2 }}>
          {channel.description}
        </span>
      </span>
      {channel.online && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#1f9d63",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#25b673",
              boxShadow: "0 0 0 3px rgba(37,182,115,0.18)",
            }}
          />
          Online
        </span>
      )}
    </MaybeLink>
  );
}

/** "Go deeper" — Documentation links + contact channels in a two-column layout. */
export function GoDeeper() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] items-start">
      <div style={{ ...CARD_STYLE, padding: 8, boxShadow: "0 1px 2px rgba(24,27,39,0.05)" }}>
        <div style={{ padding: "14px 16px 6px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: HELP_COLORS.text }}>Documentation</h3>
          <p style={{ fontSize: 13, color: HELP_COLORS.text2, marginTop: 2 }}>
            Reference guides and developer resources.
          </p>
        </div>
        {HELP_DOC_LINKS.map((doc) => (
          <DocRow key={doc.id} doc={doc} />
        ))}
      </div>

      <div style={{ ...CARD_STYLE, padding: 18, boxShadow: "0 1px 2px rgba(24,27,39,0.05)" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: HELP_COLORS.text }}>Still need help?</h3>
          <p style={{ fontSize: 13, color: HELP_COLORS.text2, marginTop: 2 }}>
            Our team usually replies within a few hours.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {HELP_CONTACT_CHANNELS.map((channel) => (
            <ContactRow key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </div>
  );
}
