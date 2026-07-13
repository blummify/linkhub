"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { PlanCard } from "../../components/PlanCard";
import { PlanEditorDialog } from "../../components/PlanEditorDialog";
import { PlanFlagsSection } from "../../components/PlanFlagsSection";
import { PlanHistorySection } from "../../components/PlanHistorySection";
import { usePlans } from "../../hooks/usePlans";
import type {
  Plan,
  PlanAdminRow,
  PlanAdminSnapshot,
  PlanEditorDraft,
} from "../../services/types";
import {
  cloneDraft,
  planEditorToFeatures,
  planEditorToLimits,
  planEditorToPrice,
  visiblePlanName,
} from "../../plans/planUtils";

const ACTOR = "Ama Mensah";

interface PendingSave {
  plan: Plan;
  draft: PlanEditorDraft;
}

export function PlansClient() {
  const { data, loading, error } = usePlans();
  const [snapshot, setSnapshot] = useState<PlanAdminSnapshot | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanAdminRow | null>(null);
  const [draft, setDraft] = useState<PlanEditorDraft | null>(null);
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  useEffect(() => {
    if (!data) return;

    const timer = window.setTimeout(() => {
      setSnapshot(data);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [data]);

  function openEditor(planKey: Plan) {
    if (!snapshot) return;
    const plan = snapshot.plans.find((entry) => entry.plan === planKey);
    if (!plan) return;
    setEditingPlan(plan);
    setDraft(cloneDraft(plan.editor));
  }

  function closeEditor() {
    setEditingPlan(null);
    setDraft(null);
  }

  function requestSave() {
    if (!editingPlan || !draft) return;
    setPendingSave({ plan: editingPlan.plan, draft: cloneDraft(draft) });
    closeEditor();
  }

  function confirmSave() {
    if (!snapshot || !pendingSave) return;
    const { plan, draft: nextDraft } = pendingSave;
    const changedAt = formatTimestamp();
    const nextPlanName = visiblePlanName(plan);
    setSnapshot((current) => {
      if (!current) return current;
      const nextVersion = current.versions.length + 1;

      return {
        ...current,
        plans: current.plans.map((entry) =>
          entry.plan === plan
            ? {
                ...entry,
                price: planEditorToPrice(nextDraft),
                limits: planEditorToLimits(nextDraft),
                features: planEditorToFeatures(nextDraft),
                editor: cloneDraft(nextDraft),
              }
            : entry
        ),
        versions: [
          {
            id: `plan-ver-${nextVersion}`,
            plan,
            version: `v${nextVersion}`,
            summary: `${nextPlanName} plan updated from the editor.`,
            changedBy: ACTOR,
            changedAt,
            fields: ["price", "interval", "limits", "storage", "feature toggles"],
          },
          ...current.versions,
        ],
        auditLog: [
          {
            id: `plan-audit-${nextVersion}`,
            action: "Plan updated",
            plan,
            actor: ACTOR,
            details: `Changed price, interval, limits, storage, and feature toggles on the ${nextPlanName} plan.`,
            timestamp: changedAt,
          },
          ...current.auditLog,
        ],
      };
    });

    setPendingSave(null);
  }

  function toggleFlag(flagId: string, enabled: boolean) {
    setSnapshot((current) => {
      if (!current) return current;
      const flag = current.flags.find((entry) => entry.id === flagId);
      if (!flag || flag.enabled === enabled) return current;

      const changedAt = formatTimestamp();
      const nextVersion = current.versions.length + 1;
      const nextFlags = current.flags.map((entry) =>
        entry.id === flagId ? { ...entry, enabled } : entry
      );

      return {
        ...current,
        flags: nextFlags,
        versions: [
          {
            id: `plan-ver-${nextVersion}`,
            plan: "all",
            version: `v${nextVersion}`,
            summary: `${flag.label} ${enabled ? "enabled" : "disabled"} from the flags panel.`,
            changedBy: ACTOR,
            changedAt,
            fields: ["feature flags"],
          },
          ...current.versions,
        ],
        auditLog: [
          {
            id: `plan-audit-${nextVersion}`,
            action: "Feature flag toggled",
            plan: "all",
            actor: ACTOR,
            details: `${flag.label} was ${enabled ? "enabled" : "disabled"} (${flag.scope}).`,
            timestamp: changedAt,
          },
          ...current.auditLog,
        ],
      };
    });
  }

  if (loading && !snapshot) {
    return (
      <div>
        <AdminPageHeader
          crumb="Admin / Plans & limits."
          title="Plans"
          accent=" & limits."
          subtitle="Tiers, pricing, limits, and feature flags."
        />
        <p className="py-10 text-center text-sm text-ink-400">Loading plans{"\u2026"}</p>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div>
        <AdminPageHeader
          crumb="Admin / Plans & limits."
          title="Plans"
          accent=" & limits."
          subtitle="Tiers, pricing, limits, and feature flags."
        />
        <p className="py-10 text-center text-sm text-rose-500">
          Failed to load plans. {error.message}
        </p>
      </div>
    );
  }

  const plans = snapshot?.plans ?? [];
  const flags = snapshot?.flags ?? [];
  const versions = snapshot?.versions ?? [];
  const auditLog = snapshot?.auditLog ?? [];
  const pendingPlan = pendingSave ? visiblePlanName(pendingSave.plan) : "";

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Plans & limits."
        title="Plans"
        accent=" & limits."
        subtitle="Tiers, pricing, limits, and feature flags."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.plan} plan={plan} onEdit={openEditor} />
        ))}
      </div>

      <div className="mt-4">
        <PlanFlagsSection flags={flags} onToggle={toggleFlag} />
      </div>

      <PlanHistorySection versions={versions} auditLog={auditLog} />

      <PlanEditorDialog
        plan={editingPlan}
        draft={draft}
        onChange={setDraft}
        onClose={closeEditor}
        onSave={requestSave}
      />

      <ConfirmDialog
        open={pendingSave !== null}
        title="Apply plan changes?"
        description={
          pendingSave
            ? `This updates pricing, limits, and entitlements for current and future ${pendingPlan} subscribers, and affects live billing. The change is versioned and audit-logged.`
            : ""
        }
        confirmLabel="Apply changes"
        confirmVariant="amber"
        onConfirm={confirmSave}
        onCancel={() => setPendingSave(null)}
      />
    </div>
  );
}

function formatTimestamp() {
  return new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
