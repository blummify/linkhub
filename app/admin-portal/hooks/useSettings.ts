"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { GeneralSettings, PlatformSettings, SafetySettings } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export interface UseSettingsResult extends AsyncState<PlatformSettings> {
  saveGeneral: (input: GeneralSettings) => Promise<void>;
  saveSafety: (input: SafetySettings) => Promise<void>;
  addReservedHandle: (handle: string) => Promise<void>;
  removeReservedHandle: (handle: string) => Promise<void>;
  setMaintenanceMode: (enabled: boolean) => Promise<void>;
  purgeCdnCache: () => Promise<void>;
}

/**
 * Loads platform settings once, then exposes mutators for each section. Local
 * state is patched only after the backing (audit-logged) mutation resolves, so
 * the UI always reflects what was actually persisted. Errors propagate to the
 * caller, which owns the toast/inline feedback.
 */
export function useSettings(): UseSettingsResult {
  const [state, setState] = useState<AsyncState<PlatformSettings>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .getSettings()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState({ data: null, loading: false, error: toError(err) });
      });
    return () => {
      active = false;
    };
  }, []);

  const patch = useCallback((update: (current: PlatformSettings) => PlatformSettings) => {
    setState((s) => (s.data ? { ...s, data: update(s.data) } : s));
  }, []);

  const saveGeneral = useCallback(
    async (input: GeneralSettings) => {
      await adminService.updateGeneralSettings(input);
      patch((c) => ({ ...c, general: input }));
    },
    [patch]
  );

  const saveSafety = useCallback(
    async (input: SafetySettings) => {
      await adminService.updateSafetySettings(input);
      patch((c) => ({ ...c, safety: input }));
    },
    [patch]
  );

  const addReservedHandle = useCallback(
    async (handle: string) => {
      await adminService.addReservedHandle(handle);
      patch((c) =>
        c.reservedHandles.includes(handle)
          ? c
          : { ...c, reservedHandles: [...c.reservedHandles, handle] }
      );
    },
    [patch]
  );

  const removeReservedHandle = useCallback(
    async (handle: string) => {
      await adminService.removeReservedHandle(handle);
      patch((c) => ({ ...c, reservedHandles: c.reservedHandles.filter((h) => h !== handle) }));
    },
    [patch]
  );

  const setMaintenanceMode = useCallback(
    async (enabled: boolean) => {
      await adminService.setMaintenanceMode(enabled);
      patch((c) => ({ ...c, system: { ...c.system, maintenanceMode: enabled } }));
    },
    [patch]
  );

  const purgeCdnCache = useCallback(async () => {
    await adminService.purgeCdnCache();
  }, []);

  return {
    ...state,
    saveGeneral,
    saveSafety,
    addReservedHandle,
    removeReservedHandle,
    setMaintenanceMode,
    purgeCdnCache,
  };
}
