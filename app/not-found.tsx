import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased flex items-center justify-center min-h-screen px-6">
      <div className="text-center max-w-md mx-auto">
        <p
          className="font-headline font-extrabold mb-4"
          style={{ fontSize: 96, lineHeight: 1, color: "#eef0f7" }}
        >
          404
        </p>
        <h1 className="font-headline text-2xl font-extrabold mb-3">Page not found</h1>
        <p className="text-on-surface-variant mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white text-sm"
          style={{ background: "linear-gradient(180deg, #3b46e0, #2a37c0)" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
