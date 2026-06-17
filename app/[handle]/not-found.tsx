import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Handle not found",
  robots: { index: false, follow: false },
};

export default function HandleNotFound() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased flex items-center justify-center min-h-screen px-6">
      <div className="text-center max-w-md mx-auto">
        <p
          className="font-headline font-extrabold mb-4"
          style={{ fontSize: 96, lineHeight: 1, color: "#eef0f7" }}
        >
          404
        </p>
        <h1 className="font-headline text-2xl font-extrabold mb-3">This page doesn&apos;t exist</h1>
        <p className="text-on-surface-variant mb-8">
          No Linkhub profile was found at this handle. It may have been changed or never claimed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm"
          style={{ background: "linear-gradient(180deg, #3b46e0, #2a37c0)" }}
        >
          Go to Linkhub
        </Link>
      </div>
    </div>
  );
}
