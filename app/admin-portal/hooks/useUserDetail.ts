"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AdminUserDetail } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export interface UserDetailResult extends AsyncState<AdminUserDetail> {
  /** Refetches the detail — call after a mutation changes this user. */
  reload: () => void;
}

export function useUserDetail(id: string): UserDetailResult {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<AsyncState<AdminUserDetail>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .getUser(id)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState({ data: null, loading: false, error: toError(err) });
      });
    return () => {
      active = false;
    };
  }, [id, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { ...state, reload };
}
