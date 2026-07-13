"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AuditPage, AuditQuery } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

interface AuditState {
  data: AuditPage | null;
  error: Error | null;
  /** Key of the query that produced `data`/`error`; null before the first result. */
  forQuery: string | null;
}

/**
 * Fetches a page of the audit log. Previous data is kept while the next page
 * resolves, and `loading` is derived so every page change reports it.
 */
export function useAuditLog(query: AuditQuery): AsyncState<AuditPage> {
  const { page, pageSize } = query;
  const queryKey = JSON.stringify([page, pageSize]);

  const [state, setState] = useState<AuditState>({ data: null, error: null, forQuery: null });

  useEffect(() => {
    let active = true;
    adminService
      .listAuditLog({ page, pageSize })
      .then((data) => {
        if (active) setState({ data, error: null, forQuery: queryKey });
      })
      .catch((err) => {
        if (active) {
          setState((prev) => ({ data: prev.data, error: toError(err), forQuery: queryKey }));
        }
      });
    return () => {
      active = false;
    };
  }, [page, pageSize, queryKey]);

  return { data: state.data, error: state.error, loading: state.forQuery !== queryKey };
}
