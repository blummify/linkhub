"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/app/admin-portal/components/AdminPageHeader";
import { Button } from "@/app/admin-portal/components/Button";
import { ChangeRoleDialog } from "@/app/admin-portal/components/ChangeRoleDialog";
import { ConfirmDialog } from "@/app/admin-portal/components/ConfirmDialog";
import { InviteAdminModal } from "@/app/admin-portal/components/InviteAdminModal";
import { RolesLegend } from "@/app/admin-portal/components/RolesLegend";
import { TeamTable } from "@/app/admin-portal/components/TeamTable";
import { useTeamMembers } from "@/app/admin-portal/hooks/useTeamMembers";
import { adminService } from "@/app/admin-portal/services/adminService";
import type { TeamMember } from "@/app/admin-portal/services/types";

export interface TeamClientProps {
    isSuperAdmin: boolean;
}

export function TeamClient({ isSuperAdmin }: TeamClientProps) {
    const { data, loading, refresh } = useTeamMembers();

  // dialog state
    const [inviteOpen, setInviteOpen] = useState(false);
    const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null);
    const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
    const [removing, setRemoving] = useState(false);

    const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    const result = await adminService.removeTeamMember(removeTarget.id);
    setRemoving(false);
    if (result.ok) {
        refresh();
        setRemoveTarget(null);
    }
    };

    return (
    <>
        <AdminPageHeader
            crumb="Admin / Team & roles."
            title="Team "
            accent="& roles."
            subtitle="Admin members and what they can do."
            action={
                isSuperAdmin ? (
                    <Button variant="primary" onClick={() => setInviteOpen(true)}>
                        Invite admin
                    </Button>
                ) : undefined
            }
        />

      {/* Member table */}
      <div className="mt-6">
        {loading || !data ? (
          <TeamTableSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <TeamTable
            members={data}
            canManage={isSuperAdmin}
            onChangeRole={setRoleTarget}
            onRemove={setRemoveTarget}
          />
        )}
      </div>

      {/* Roles & permissions reference */}
      <div className="mt-6">
        <RolesLegend />
      </div>

      {/* Dialogs — mounted here*/}
      {inviteOpen && (
        <InviteAdminModal
          onClose={() => setInviteOpen(false)}
          onInvited={refresh}
        />
      )}

      <ChangeRoleDialog
        key={roleTarget?.id ?? "closed"}
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onChanged={refresh}
      />

      <ConfirmDialog
        open={removeTarget != null}
        title="Remove admin access?"
        description="This revokes all admin access for this member immediately. This action is logged."
        confirmLabel="Remove access"
        confirmVariant="danger"
        loading={removing}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  );
}

// local presentational bits, kept private 

function TeamTableSkeleton() {
  return (
    <div className="rounded-[16px] border border-ink-100 bg-white p-6">
      <div className="space-y-3">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="h-12 animate-pulse rounded-lg bg-ink-100" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[16px] border border-ink-100 bg-white p-10 text-center">
      <p className="text-[14px] font-medium text-ink-900">No admins yet</p>
      <p className="mt-1 text-[13px] text-ink-500">
        Invite the first admin to get started.
      </p>
    </div>
  );
}