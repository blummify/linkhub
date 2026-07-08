"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { PagePage, PageQuery } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function usePages(query: PageQuery): AsyncState<PagePage> {
  const { search, filter, sort, page, pageSize } = query;
  const queryKey = JSON.stringify([search, filter, sort, page, pageSize]);
  const [state, setState] = useState<{
    data: PagePage | null;
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
      .listPages({ search, filter, sort, page, pageSize })
      .then((data) => {
        if (active) setState({ data, resolvedKey: queryKey, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ data: prev.data, resolvedKey: queryKey, error: toError(err) }));
      });
    return () => {
      active = false;
    };
  }, [search, filter, sort, page, pageSize, queryKey]);

  return {
    data: state.data,
    loading: state.resolvedKey !== queryKey,
    error: state.error,
  };
}
