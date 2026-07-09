"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import type { TeamMember } from "../services/types";

export interface UseTeamMembersResult {
    data: TeamMember[] | undefined;
    loading: boolean;
    refresh: () => void;
}

export function useTeamMembers(): UseTeamMembersResult {
    const [data, setData] = useState<TeamMember[] | undefined>(undefined);
    const [refreshKey, setRefreshKey] = useState(0);
    const [resolvedKey, setResolvedKey] = useState(-1);

    useEffect(() => {
        let cancelled = false;
        adminService.listTeamMembers().then((rows) => {
            if (cancelled) return;
            setData(rows);
            setResolvedKey(refreshKey);
        });
    return () => {
        cancelled = true;
    };
    }, [refreshKey]);

    const refresh = useCallback(() => setRefreshKey((n) => n + 1), []);

    const loading = resolvedKey !== refreshKey;

    return { data, loading, refresh };
}