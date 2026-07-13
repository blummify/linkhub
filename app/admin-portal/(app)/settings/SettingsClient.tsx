"use client";

import { AdminPageHeader } from "../../components/AdminPageHeader";
import { useSettings } from "../../hooks/useSettings";
import { DangerZoneCard } from "./DangerZoneCard";
import { GeneralCard } from "./GeneralCard";
import { ReservedHandlesCard } from "./ReservedHandlesCard";
import { SafetyCard } from "./SafetyCard";

export function SettingsClient() {
  const {
    data,
    loading,
    error,
    saveGeneral,
    saveSafety,
    addReservedHandle,
    removeReservedHandle,
    setMaintenanceMode,
    purgeCdnCache,
  } = useSettings();

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Settings"
        title="Set"
        accent="tings."
        subtitle="Platform-wide configuration."
      />

      {loading && !data ? (
        <p className="py-10 text-center text-sm text-ink-400">Loading settings…</p>
      ) : error || !data ? (
        <div className="grid min-h-[260px] place-items-center text-center text-sm text-ink-500">
          Couldn&apos;t load settings. Refresh to try again.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <GeneralCard value={data.general} onSave={saveGeneral} />
          <SafetyCard value={data.safety} onSave={saveSafety} />
          <ReservedHandlesCard
            handles={data.reservedHandles}
            onAdd={addReservedHandle}
            onRemove={removeReservedHandle}
          />
          <DangerZoneCard
            maintenanceMode={data.system.maintenanceMode}
            onSetMaintenance={setMaintenanceMode}
            onPurgeCache={purgeCdnCache}
          />
        </div>
      )}
    </div>
  );
}
