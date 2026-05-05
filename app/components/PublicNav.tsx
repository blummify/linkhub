import Image from "next/image";
import Link from "next/link";

type PublicNavProps = {
  activePage?: "features" | "pricing";
};

export function PublicNav({ activePage }: PublicNavProps) {
  const defaultNavLink =
    "text-slate-600 hover:text-indigo-600 transition-all hover:translate-y-[-1px]";

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-surface-variant/20">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-headline tracking-tight hover:scale-105 transition-transform"
        >
          <span className="flex items-center">
            <span className="sr-only">LinkHub</span>
            <Image
              src="/link_hub_logo.png"
              alt="LinkHub logo"
              width={256}
              height={256}
              loading="eager"
              className="h-auto w-32 max-w-full object-contain"
            />
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-headline font-semibold tracking-tight">
          <Link
            className={activePage === "features" ? "text-primary border-b-2 border-primary pb-1" : defaultNavLink}
            href="/features"
          >
            Features
          </Link>
          <Link
            className={activePage === "pricing" ? "text-primary border-b-2 border-primary pb-1" : defaultNavLink}
            href="/pricing"
          >
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 text-primary font-semibold rounded-full hover:bg-surface-container-low/70 dark:hover:bg-white/5 transition-all scale-100 hover:scale-105 active:scale-95 duration-200"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="cta-gradient px-6 py-2.5 text-white rounded-full font-bold shadow-lg hover:shadow-primary/30 hover:opacity-95 transition-all hover:scale-105 active:scale-95 duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
