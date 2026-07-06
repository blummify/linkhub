"use client";

import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { toast } from "sonner";
import { useUserDetail } from "../../hooks/useUserDetail";
import { adminService } from "../../services/adminService";
import { formatDate } from "../../format";
import type { Plan } from "../../services/types";
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
    description: "Their page goes offline immediately. You can reinstate them later.",
    confirmLabel: "Suspend",
    variant: "amber",
  },
  delete: {
    title: "Delete user?",
    description: "This permanently removes the account and its pages. This can't be undone.",
    confirmLabel: "Delete",
    variant: "danger",
  },
};

const NEXT_PLAN: Record<Plan, Plan> = { free: "pro", pro: "business", business: "free" };

export function UserDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, loading } = useUserDetail(userId);
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
      const shouldClose = pending !== "impersonate";
      setPending(null);
      if (shouldClose) onClose();
    } finally {
      setActing(false);
    }
  }

  async function handleChangePlan() {
    if (!user) return;
    await adminService.changeUserPlan(userId, NEXT_PLAN[user.plan]);
    toast.success("Plan updated");
  }

  async function handleSendReset() {
    await adminService.sendPasswordReset(userId);
    toast.success("Reset email sent");
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
          <header className="border-b border-ink-100 p-[22px]">
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
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto p-[22px]">
            {loading && !user ? (
              <p className="text-sm text-ink-400">Loading user…</p>
            ) : !user ? (
              <p className="text-sm text-ink-500">This user could not be found.</p>
            ) : (
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

                <DrawerSection title="Usage this period">
                  {user.usage.map((metric) => (
                    <UsageBar key={metric.label} metric={metric} />
                  ))}
                </DrawerSection>

                <DrawerSection title="Recent activity">
                  {user.recentActivity.map((item) => (
                    <RowItem key={item.id} title={item.title} subtitle={item.meta} />
                  ))}
                </DrawerSection>
              </>
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
            <Button variant="amber" disabled={!user} onClick={() => setPending("suspend")}>
              Suspend
            </Button>
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
