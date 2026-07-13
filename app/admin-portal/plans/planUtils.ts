import type { Plan, PlanEditorDraft, PlanLimitSet } from "../services/types";

export function toggleLabel(toggle: string) {
  switch (toggle) {
    case "linkhubBadge":
      return "linkhub badge shown";
    case "removeBadge":
      return "Remove linkhub badge";
    case "customThemeEditor":
      return "Custom theme editor";
    case "teamSeats":
      return "Team seats";
    case "prioritySupport":
      return "Priority support";
    default:
      return toggle;
  }
}

export function planEditorToPrice(editor: PlanEditorDraft) {
  if (editor.price === "0.00") return "Free";
  return `€${editor.price}${editor.interval === "Yearly" ? "/yr" : "/mo"}`;
}

export function planEditorToLimits(editor: PlanEditorDraft): PlanLimitSet {
  return {
    links: editor.linkLimit === "Unlimited" ? "Unlimited links" : `${editor.linkLimit} links`,
    views: `${Number(editor.monthlyViews.replace(/,/g, "")).toLocaleString("en-US")} views/mo`,
    customDomains: editor.customDomains === "0" ? "No custom domain" : `${editor.customDomains} custom domains`,
    storage: `${editor.storage} GB storage`,
  };
}

export function planEditorToFeatures(editor: PlanEditorDraft) {
  return Object.entries(editor.featureToggles)
    .filter(([, enabled]) => enabled)
    .map(([toggle]) => toggleLabel(toggle))
    .filter(Boolean);
}

export function cloneDraft(editor: PlanEditorDraft): PlanEditorDraft {
  return {
    price: editor.price,
    interval: editor.interval,
    linkLimit: editor.linkLimit,
    monthlyViews: editor.monthlyViews,
    customDomains: editor.customDomains,
    storage: editor.storage,
    featureToggles: { ...editor.featureToggles },
  };
}

export function visiblePlanName(plan: Plan | "all") {
  return plan === "all" ? "All plans" : plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Business";
}
