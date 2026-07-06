"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AdminUserDetail } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function useUserDetail(id: string): AsyncState<AdminUserDetail> {
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
  }, [id]);

  return state;
}
