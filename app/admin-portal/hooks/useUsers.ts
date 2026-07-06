"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { UserPage, UserQuery } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

/**
 * Fetches a page of users for the given query. Previous data is kept while a new
 * query resolves so the table doesn't flash empty between searches/pages.
 */
export function useUsers(query: UserQuery): AsyncState<UserPage> {
  const { search, filter, page, pageSize } = query;
  const [state, setState] = useState<AsyncState<UserPage>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    adminService
      .listUsers({ search, filter, page, pageSize })
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ data: prev.data, loading: false, error: toError(err) }));
      });
    return () => {
      active = false;
    };
  }, [search, filter, page, pageSize]);

  return state;
}
