"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AdminPageDetail } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function usePageDetail(id: string): AsyncState<AdminPageDetail> {
  const [state, setState] = useState<{
    data: AdminPageDetail | null;
    resolvedKey: string;
    error: Error | null;
  }>({
    data: null,
    resolvedKey: "",
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .getPage(id)
      .then((data) => {
        if (active) setState({ data, resolvedKey: id, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ data: prev.data, resolvedKey: id, error: toError(err) }));
      });
    return () => {
      active = false;
    };
  }, [id]);

  return {
    data: state.data,
    loading: state.resolvedKey !== id,
    error: state.error,
  };
}
