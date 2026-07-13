"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { UserPage, UserQuery } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

interface UsersState {
  data: UserPage | null;
  error: Error | null;
  /** Key of the query that produced `data`/`error`; null before the first result. */
  forQuery: string | null;
}

export interface UsersResult extends AsyncState<UserPage> {
  /** Refetches the current query — call after a mutation changes the dataset. */
  reload: () => void;
}

/**
 * Fetches a page of users for the given query. Previous data is kept while a new
 * query resolves so the table doesn't flash empty between searches/pages, and
 * `loading` is derived (result key ≠ current key) so every refetch reports it.
 */
export function useUsers(query: UserQuery): UsersResult {
  const { search, filter, page, pageSize, sort, dir } = query;
  const [tick, setTick] = useState(0);
  const queryKey = JSON.stringify([search, filter, page, pageSize, sort, dir, tick]);

  const [state, setState] = useState<UsersState>({ data: null, error: null, forQuery: null });

  useEffect(() => {
    let active = true;
    adminService
      .listUsers({ search, filter, page, pageSize, sort, dir })
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
  }, [search, filter, page, pageSize, sort, dir, queryKey]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { data: state.data, error: state.error, loading: state.forQuery !== queryKey, reload };
}
