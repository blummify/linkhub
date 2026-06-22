"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import UserAvatar from "./UserAvatar";
import { LinkhubLogo } from "./icons/LinkhubLogo";

type PublicNavProps = {
  activePage?: "features" | "pricing";
};

export function PublicNav({ activePage }: PublicNavProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // Tap-to-toggle for mobile (no hover); desktop keeps the group-hover behavior.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const defaultNavLink =
    "text-slate-600 hover:text-indigo-600 transition-all hover:translate-y-[-1px]";

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-surface-variant/20">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 font-headline tracking-tight hover:scale-105 transition-transform"
        >
          <LinkhubLogo size="md" />
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
          {user ? (
            <div ref={menuRef} className="relative group">
              {/* Avatar trigger */}
              <button
                type="button"
                onClick={() => setMenuOpen((p) => !p)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="relative flex items-center gap-1.5 active:scale-95 transition-all duration-200"
              >
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/20 to-primary/0 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
                <UserAvatar
                  src={user.image}
                  name={user.name}
                  email={user.email}
                  className="relative w-9 h-9 rounded-full border-2 border-primary/20 group-hover:border-primary/60 transition-all object-cover ring-1 ring-outline-variant/30 group-hover:ring-primary/50"
                />
                <span className="material-symbols-outlined text-slate-500 text-[16px] group-hover:text-primary transition-colors">keyboard_arrow_down</span>
              </button>

              {/* Dropdown — hover bridge via pt-3 keeps it open; menuOpen forces it on tap (mobile) */}
              <div
                role="menu"
                className={`absolute top-full right-0 pt-3 w-52 transition-all duration-300 z-50 ${
                  menuOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                }`}
              >
                <div className="bg-white/90 dark:bg-surface/90 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-2xl p-2 overflow-hidden">
                  {/* User info */}
                  <div className="px-3 py-2.5 border-b border-outline-variant/20 mb-1">
                    <p className="text-[13px] font-bold tracking-tight text-on-surface truncate">{user.name ?? user.email}</p>
                    <p className="text-[11px] text-on-surface-variant/60 truncate">{user.email}</p>
                  </div>

                  {/* Dashboard */}
                  <Link
                    href="/user-dashboard"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] opacity-60">dashboard</span>
                    Dashboard
                  </Link>

                  <div className="h-px bg-outline-variant/20 my-1 mx-1" />

                  {/* Logout */}
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-500/80 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-colors text-left"
                    onClick={() => {
                      setMenuOpen(false);
                      localStorage.removeItem("linkhub-branding-v2");
                      localStorage.removeItem("linkhub-branding-v1");
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
