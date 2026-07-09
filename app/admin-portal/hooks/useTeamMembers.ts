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
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        adminService.listTeamMembers().then((rows) => {
        if (cancelled) return;
        setData(rows);
        setLoading(false);
    });
    return () => {
        cancelled = true;
    };
    }, [refreshKey]);

    const refresh = useCallback(() => setRefreshKey((n) => n + 1), []);

    return { data, loading, refresh };
}