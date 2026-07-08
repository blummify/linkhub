"use client";

import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { PagePage, PageQuery } from "../services/types";
import { type AsyncState, toError } from "./asyncState";

export function usePages(query: PageQuery): AsyncState<PagePage> {
  const { search, filter, sort, page, pageSize } = query;
  const [state, setState] = useState<AsyncState<PagePage>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));
    adminService
      .listPages({ search, filter, sort, page, pageSize })
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ data: prev.data, loading: false, error: toError(err) }));
      });
    return () => {
      active = false;
    };
  }, [search, filter, sort, page, pageSize]);

  return state;
}
