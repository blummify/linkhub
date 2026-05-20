"use client";

interface ProfileSectionProps {
  displayName: string;
  bio: string;
  onDisplayNameChange: (v: string) => void;
  onBioChange: (v: string) => void;
}

const MAX_BIO = 140;

const fieldLabel: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  color: "#6b75a3",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

const baseInput: React.CSSProperties = {
  width: "100%",
  background: "#f7f8fc",
  border: "1px solid #eef0f7",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 14,
  color: "#0b1020",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#3b46e0";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,70,224,0.08)";
}

function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#eef0f7";
  e.currentTarget.style.boxShadow = "none";
}

export function ProfileSection({
  displayName,
  bio,
  onDisplayNameChange,
  onBioChange,
}: ProfileSectionProps) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #eef0f7",
        borderRadius: 18,
        padding: "22px 24px",
      }}
    >
      {/* Avatar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b46e0, #7a85ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 26,
              fontStyle: "italic",
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              border: "3px solid white",
              boxShadow: "0 4px 16px -4px rgba(59,70,224,0.4)",
            }}
          >
            {displayName.charAt(0).toUpperCase() || "?"}
          </div>
          <button
            type="button"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#0b1020",
              color: "white",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Edit photo"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 012.828 2.828L11.828 13.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z"/>
            </svg>
          </button>
        </div>

        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0b1020", marginBottom: 3 }}>Profile photo</p>
          <p style={{ fontSize: 12, color: "#6b75a3" }}>JPG, PNG or SVG. Max 2MB.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 12px",
                border: "1px solid #eef0f7",
                borderRadius: 8,
                background: "white",
                color: "#0b1020",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Upload
            </button>
            <button
              type="button"
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 12px",
                border: 0,
                background: "transparent",
                color: "#6b75a3",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={fieldLabel}>Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Your name"
            style={baseInput}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <label style={fieldLabel}>Short bio</label>
            <span
              style={{
                fontSize: 11,
                color: bio.length > MAX_BIO * 0.85 ? "#ef4444" : "#a8aecb",
                transition: "color 0.15s",
              }}
            >
              {bio.length}/{MAX_BIO}
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value.slice(0, MAX_BIO))}
            placeholder="Tell your story..."
            rows={3}
            style={{ ...baseInput, resize: "none", lineHeight: 1.6 }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>
    </div>
  );
}
