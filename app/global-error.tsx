"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fbf8ff",
          color: "#1a1b22",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 700, margin: "0 0 1rem" }}>
            500 - Server Error
          </h1>
          <p style={{ color: "#4b5563", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
            Something went wrong on our end. We&apos;re working to fix it. Please try again later.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- hard navigation: root layout has failed, the Next router may be unusable */}
            <a
              href="/"
              style={{
                backgroundColor: "#1f33aa",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "block",
              }}
            >
              Back to Home
            </a>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                color: "#374151",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
