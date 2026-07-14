"use client";

import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { useUserDetail } from "../../hooks/useUserDetail";
import { adminService } from "../../services/adminService";
import { formatDate, formatDateTime, summarizeUserAgent } from "../../format";
import type { AdminUserDetail, Plan } from "../../services/types";
import { Avatar } from "../Avatar";
import { PlanBadge, StatusBadge } from "../Badge";
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { Icon } from "../../icons";
import { RowItem } from "../RowItem";
import { DrawerSection } from "./DrawerSection";
import { UsageBar } from "./UsageBar";
import type { ButtonVariant } from "../Button";

type ActionKind = "impersonate" | "suspend" | "delete";

const CONFIRM_COPY: Record<
  ActionKind,
  { title: string; description: string; confirmLabel: string; variant: ButtonVariant }
> = {
  impersonate: {
    title: "Impersonate user?",
    description: "You'll browse LinkHub as this user. The session is recorded in the audit log.",
    confirmLabel: "Impersonate",
    variant: "primary",
  },
  suspend: {
    title: "Suspend user?",
    description:
      "Their page goes offline immediately. This action is logged; you can reinstate them later.",
    confirmLabel: "Suspend",
    variant: "amber",
  },
  delete: {
    title: "Delete user?",
    description:
      "This permanently removes the account and its pages. This action is logged and cannot be undone.",
    confirmLabel: "Delete",
    variant: "danger",
  },
};

const NEXT_PLAN: Record<Plan, Plan> = { free: "pro", pro: "business", business: "free" };

type DrawerTab = "overview" | "activity" | "security";

const TABS: { value: DrawerTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "security", label: "Security" },
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface UserDetailDrawerProps {
  userId: string;
  onClose: () => void;
  /** Called after any successful mutation so the parent list can refetch. */
  onMutated?: () => void;
}

export function UserDetailDrawer({ userId, onClose, onMutated }: UserDetailDrawerProps) {
  const { data: user, loading, reload } = useUserDetail(userId);
  const [tab, setTab] = useState<DrawerTab>("overview");
  const [pending, setPending] = useState<ActionKind | null>(null);
  const [acting, setActing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the drawer when it opens.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape closes the confirm dialog first, then the drawer.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pending) setPending(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  function reportError(err: unknown) {
    toast.error(err instanceof Error ? err.message : "Action failed");
  }

  async function runPendingAction() {
    if (!pending) return;
    setActing(true);
    try {
      if (pending === "impersonate") {
        await adminService.impersonateUser(userId);
        toast.success("Impersonation session started");
      } else if (pending === "suspend") {
        await adminService.suspendUser(userId);
        toast.success("User suspended");
      } else {
        await adminService.deleteUser(userId);
        toast.success("User deleted");
      }
      if (pending !== "impersonate") onMutated?.();
      const shouldClose = pending !== "impersonate";
      setPending(null);
      if (shouldClose) onClose();
    } catch (err) {
      reportError(err);
    } finally {
      setActing(false);
    }
  }

  async function handleUnsuspend() {
    try {
      await adminService.unsuspendUser(userId);
      toast.success("User reinstated — their page is back online");
      onMutated?.();
      reload();
    } catch (err) {
      reportError(err);
    }
  }

  async function handleChangePlan() {
    if (!user) return;
    try {
      await adminService.changeUserPlan(userId, NEXT_PLAN[user.plan]);
      toast.success("Plan updated");
      onMutated?.();
      reload();
    } catch (err) {
      reportError(err);
    }
  }

  async function handleSendReset() {
    try {
      await adminService.sendPasswordReset(userId);
      toast.success("Reset email sent");
    } catch (err) {
      reportError(err);
    }
  }

  function moveTab(offset: number) {
    const index = TABS.findIndex((t) => t.value === tab);
    const next = TABS[(index + offset + TABS.length) % TABS.length].value;
    setTab(next);
    document.getElementById(`drawer-tab-${next}`)?.focus();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-ink-900/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <FocusTrap>
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="User detail"
          className="fixed right-0 top-0 z-[91] flex h-screen w-[420px] max-w-[92vw] flex-col bg-white shadow-2xl"
        >
          <header className="border-b border-ink-100 p-[22px] pb-0">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Avatar name={user?.name} size="lg" tone="indigo" />
                <div>
                  <div className="text-[17px] font-semibold text-ink-900">
                    {user?.name ?? "Loading…"}
                  </div>
                  <div className="text-[13px] text-ink-400">{user?.email}</div>
                  {user && <div className="mt-0.5 text-[12.5px] text-indigo-500">{user.handle}</div>}
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-[34px] w-[34px] place-items-center rounded-full bg-ink-100 text-ink-500 hover:text-ink-700"
              >
                <Icon name="close" className="h-[15px] w-[15px]" />
              </button>
            </div>
            {user && (
              <div className="mt-3.5 flex gap-2">
                <PlanBadge plan={user.plan} />
                <StatusBadge status={user.status} />
              </div>
            )}
            <div
              role="tablist"
              aria-label="User detail sections"
              className="mt-3.5 flex gap-1"
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTab(1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTab(-1);
                }
              }}
            >
              {TABS.map((t) => {
                const active = tab === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    role="tab"
                    id={`drawer-tab-${t.value}`}
                    aria-selected={active}
                    aria-controls={`drawer-panel-${t.value}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(t.value)}
                    className={cn(
                      "-mb-px border-b-2 px-3 py-2.5 text-[13px] transition-colors motion-reduce:transition-none",
                      active
                        ? "border-ink-900 font-medium text-ink-900"
                        : "border-transparent text-ink-500 hover:text-ink-700"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </header>

          <div
            role="tabpanel"
            id={`drawer-panel-${tab}`}
            aria-labelledby={`drawer-tab-${tab}`}
            className="flex-1 space-y-5 overflow-y-auto p-[22px]"
          >
            {loading && !user ? (
              <p className="text-sm text-ink-400">Loading user…</p>
            ) : !user ? (
              <p className="text-sm text-ink-500">This user could not be found.</p>
            ) : tab === "overview" ? (
              <OverviewTab user={user} />
            ) : tab === "activity" ? (
              <ActivityTab user={user} />
            ) : (
              <SecurityTab user={user} />
            )}
          </div>

          <footer className="grid grid-cols-2 gap-2 border-t border-ink-100 p-[18px]">
            <Button
              variant="primary"
              className="col-span-2"
              disabled={!user}
              onClick={() => setPending("impersonate")}
            >
              <Icon name="impersonate" className="h-4 w-4" />
              Impersonate (view as user)
            </Button>
            <Button disabled={!user} onClick={handleChangePlan}>
              Change plan
            </Button>
            <Button disabled={!user} onClick={handleSendReset}>
              Send reset
            </Button>
            {user?.status === "suspended" ? (
              <Button onClick={handleUnsuspend}>Unsuspend</Button>
            ) : (
              <Button variant="amber" disabled={!user} onClick={() => setPending("suspend")}>
                Suspend
              </Button>
            )}
            <Button variant="danger" disabled={!user} onClick={() => setPending("delete")}>
              Delete
            </Button>
          </footer>
        </aside>
      </FocusTrap>

      {pending && (
        <ConfirmDialog
          open
          title={CONFIRM_COPY[pending].title}
          description={CONFIRM_COPY[pending].description}
          confirmLabel={CONFIRM_COPY[pending].confirmLabel}
          confirmVariant={CONFIRM_COPY[pending].variant}
          loading={acting}
          onConfirm={runPendingAction}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}

function OverviewTab({ user }: { user: AdminUserDetail }) {
  const { billing } = user;
  return (
    <>
      <DrawerSection title="Account">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Fact label="User ID" value={user.id} mono />
          <Fact label="Joined" value={formatDate(user.joinedAt)} />
          <Fact label="Country" value={user.country} />
          <Fact
            label="Last active"
            value={user.lastActiveAt ? formatDate(user.lastActiveAt) : "—"}
          />
        </dl>
      </DrawerSection>

      <DrawerSection title="Plan & billing">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Fact label="Plan" value={capitalize(billing.plan)} />
          <Fact label="Status" value={capitalize(billing.status)} />
          <Fact label="Renews" value={billing.renewsAt ? formatDate(billing.renewsAt) : "—"} />
          <Fact
            label="Card"
            value={billing.card ? `${capitalize(billing.card.brand)} •••• ${billing.card.last4}` : "—"}
          />
        </dl>
        {billing.cancelAtPeriodEnd && (
          <p className="mt-2 text-[12.5px] text-amber-500">
            Cancels at the end of the current period.
          </p>
        )}
      </DrawerSection>

      <DrawerSection title="Usage">
        {user.usage.map((metric) =>
          metric.limit > 0 ? (
            <UsageBar key={metric.label} metric={metric} />
          ) : (
            <div key={metric.label} className="my-2 flex items-center justify-between text-[13px]">
              <span className="text-ink-500">{metric.label}</span>
              <span className="tabular-nums text-ink-900">{metric.display}</span>
            </div>
          )
        )}
      </DrawerSection>
    </>
  );
}

function ActivityTab({ user }: { user: AdminUserDetail }) {
  if (user.recentActivity.length === 0) {
    return <p className="text-sm text-ink-500">No recent activity yet.</p>;
  }
  return (
    <DrawerSection title="Recent activity">
      {user.recentActivity.map((item) => (
        <RowItem key={item.id} title={item.title} subtitle={item.meta} />
      ))}
    </DrawerSection>
  );
}

function SecurityTab({ user }: { user: AdminUserDetail }) {
  const { security } = user;
  const signInMethods = [
    ...security.providers.map(capitalize),
    ...(security.passwordSet ? ["Password"] : []),
  ];

  return (
    <>
      <DrawerSection title="Security">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Fact
            label="Two-factor auth"
            value={security.twoFactorEnabled ? "Enabled" : "Disabled"}
          />
          <Fact
            label="Backup codes"
            value={security.twoFactorEnabled ? `${security.backupCodesRemaining} remaining` : "—"}
          />
          <Fact label="Password" value={security.passwordSet ? "Set" : "Not set (OAuth only)"} />
          <Fact label="Sign-in methods" value={signInMethods.join(", ") || "—"} />
          <Fact
            label="Email verified"
            value={security.emailVerifiedAt ? formatDate(security.emailVerifiedAt) : "Unverified"}
          />
          <Fact
            label="Last sign-in"
            value={user.lastActiveAt ? formatDateTime(user.lastActiveAt) : "—"}
          />
        </dl>
      </DrawerSection>

      <DrawerSection title="Recent logins">
        {security.recentLogins.length === 0 ? (
          <p className="text-sm text-ink-500">No recorded logins yet.</p>
        ) : (
          security.recentLogins.map((login) => (
            <RowItem
              key={login.id}
              title={formatDateTime(login.at)}
              subtitle={
                [login.country, login.ip, login.userAgent && summarizeUserAgent(login.userAgent)]
                  .filter(Boolean)
                  .join(" · ") || "No location data"
              }
            />
          ))
        )}
      </DrawerSection>
    </>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11.5px] text-ink-400">{label}</dt>
      <dd
        className={
          mono
            ? "mt-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] font-medium text-ink-900"
            : "mt-0.5 text-sm font-medium text-ink-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}
