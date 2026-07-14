"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Toggle } from "../../components/Toggle";
import { SettingRow } from "./SettingRow";

type PendingAction = "maintenance" | "purge" | null;

export interface DangerZoneCardProps {
  maintenanceMode: boolean;
  onSetMaintenance: (enabled: boolean) => Promise<void>;
  onPurgeCache: () => Promise<void>;
}

export function DangerZoneCard({
  maintenanceMode,
  onSetMaintenance,
  onPurgeCache,
}: DangerZoneCardProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [working, setWorking] = useState(false);

  const nextMaintenance = !maintenanceMode;

  async function confirm() {
    setWorking(true);
    try {
      if (pending === "maintenance") {
        await onSetMaintenance(nextMaintenance);
        toast.success(
          nextMaintenance
            ? "Maintenance mode enabled — platform offline"
            : "Maintenance mode disabled — platform live",
          { description: "Change recorded in the audit log." }
        );
      } else if (pending === "purge") {
        await onPurgeCache();
        toast.success("CDN cache purged", { description: "Change recorded in the audit log." });
      }
      setPending(null);
    } catch {
      toast.error("Action failed. Try again.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Card title={<span className="text-rose-500">Danger zone</span>} className="ring-1 ring-rose-500/30">
      <SettingRow
        title={
          <span className="flex items-center gap-2">
            Maintenance mode
            <Badge tone={maintenanceMode ? "rose" : "green"}>
              {maintenanceMode ? "Offline" : "Live"}
            </Badge>
          </span>
        }
        description="Takes the whole platform offline for users"
        control={
          <Toggle
            checked={maintenanceMode}
            onChange={() => setPending("maintenance")}
            aria-label="Maintenance mode"
          />
        }
        className="pt-0"
      />

      <SettingRow
        title="Purge CDN cache"
        description="Forces all pages to re-render"
        control={
          <Button variant="danger" onClick={() => setPending("purge")}>
            Purge
          </Button>
        }
      />

      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-400">
        Destructive actions require confirmation and are recorded in the audit log.
      </p>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending === "purge"
            ? "Purge CDN cache?"
            : nextMaintenance
              ? "Enable maintenance mode?"
              : "Disable maintenance mode?"
        }
        description={
          pending === "purge"
            ? "All public pages will re-render. Expect a brief slowdown. This action is logged."
            : nextMaintenance
              ? "This takes the entire platform offline for all users until disabled. This action is logged."
              : "This brings the platform back online for all users. This action is logged."
        }
        confirmLabel={
          pending === "purge"
            ? "Purge cache"
            : nextMaintenance
              ? "Enable maintenance"
              : "Disable maintenance"
        }
        confirmVariant={pending === "purge" ? "amber" : nextMaintenance ? "danger" : "primary"}
        loading={working}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </Card>
  );
}
