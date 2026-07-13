"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { PlanAdminSnapshot } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function usePlans(): AsyncState<PlanAdminSnapshot> {
  const [state, setState] = useState<AsyncState<PlanAdminSnapshot>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .getPlans()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ data: prev.data, loading: false, error: toError(err) }));
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
