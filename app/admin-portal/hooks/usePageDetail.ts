"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AdminPageDetail } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function usePageDetail(id: string): AsyncState<AdminPageDetail> {
  const [state, setState] = useState<AsyncState<AdminPageDetail>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));
    adminService
      .getPage(id)
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
