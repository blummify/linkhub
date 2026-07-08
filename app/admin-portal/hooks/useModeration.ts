"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { Report, ReportStatus } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function useModeration(status: ReportStatus): AsyncState<Report[]> {
  const [state, setState] = useState<AsyncState<Report[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .listReports(status)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState({ data: null, loading: false, error: toError(err) });
      });
    return () => {
      active = false;
    };
  }, [status]);

  return state;
}
