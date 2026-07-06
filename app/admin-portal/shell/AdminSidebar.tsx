"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LinkhubLogo } from "@/app/components/icons/LinkhubLogo";
import { Avatar } from "../components/Avatar";
import { Icon } from "../icons";
import { isNavItemActive, NAV_GROUPS } from "./nav";

export interface AdminUserInfo {
  name: string;
  email: string;
  role: string;
}

function roleLabel(role: string): string {
  return role === "SUPER_ADMIN" ? "Super admin" : role.toLowerCase();
}

/** Leave the admin subdomain back to the main app (strip the "admin." host part). */
function exitToMainApp() {
  const { protocol, host } = window.location;
  window.location.href = `${protocol}//${host.replace(/^admin\./, "")}`;
}

export function AdminSidebar({
  user,
  onNavigate,
}: {
  user: AdminUserInfo;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[248px] flex-col bg-ink-900 text-white">
      <div className="flex items-center gap-2.5 px-5 pb-[18px] pt-5">
        <LinkhubLogo size="sm" />
        <span className="rounded-full border border-indigo-400/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-400">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Admin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-[11px] rounded-[8px] px-2.5 py-2.5 text-sm transition-colors motion-reduce:transition-none",
                    active
                      ? "bg-indigo-500 text-white"
                      : "text-ink-200 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px] flex-none" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        active ? "bg-white/25 text-white" : "bg-amber-500 text-white"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-[8px] p-2">
          <Avatar name={user.name} tone="indigo" />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium leading-tight text-white">
              {user.name}
            </div>
            <div className="text-[11px] capitalize text-ink-400">{roleLabel(user.role)}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={exitToMainApp}
          className="mt-1.5 flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2.5 text-left text-[12.5px] text-ink-300 transition-colors hover:bg-white/[0.06] hover:text-white motion-reduce:transition-none"
        >
          <Icon name="exit" className="h-[15px] w-[15px]" />
          Back to app
        </button>
      </div>
    </aside>
  );
}
