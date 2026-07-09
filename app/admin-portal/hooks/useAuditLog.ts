"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { AuditLogPage, AuditLogQuery } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

/**
 * Fetches a page of the audit log for the given query. Previous data is kept
 * while a new query resolves so the table doesn't flash empty between
 * searches/filters/pages.
 */
export function useAuditLog(query: AuditLogQuery): AsyncState<AuditLogPage> {
  const { search, actorId, actionType, range, page, pageSize } = query;
  const [state, setState] = useState<AsyncState<AuditLogPage>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .listAuditLog({ search, actorId, actionType, range, page, pageSize })
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ data: prev.data, loading: false, error: toError(err) }));
      });
    return () => {
      active = false;
    };
  }, [search, actorId, actionType, range, page, pageSize]);

  return state;
}
