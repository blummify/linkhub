"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { OverviewMetrics } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function useOverviewMetrics(): AsyncState<OverviewMetrics> {
  const [state, setState] = useState<AsyncState<OverviewMetrics>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .getOverviewMetrics()
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

  return state;
}
