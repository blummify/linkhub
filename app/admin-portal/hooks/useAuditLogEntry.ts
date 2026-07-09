"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AuditLogEntryDetail } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function useAuditLogEntry(id: string): AsyncState<AuditLogEntryDetail> {
  const [state, setState] = useState<AsyncState<AuditLogEntryDetail>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .getAuditLogEntry(id)
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
