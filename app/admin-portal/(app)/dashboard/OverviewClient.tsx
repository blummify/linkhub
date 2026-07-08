"use client";

import { AdminPageHeader } from "../../components/AdminPageHeader";
import { Avatar } from "../../components/Avatar";
import { Card } from "../../components/Card";
import { DistributionBars } from "../../components/DistributionBars";
import { KpiCard } from "../../components/KpiCard";
import { PlanBadge, SeverityBadge } from "../../components/Badge";
import { RowItem } from "../../components/RowItem";
import { StatusList } from "../../components/StatusList";
import { TrendChart } from "../../components/TrendChart";
import { Icon } from "../../icons";
import { useOverviewMetrics } from "../../hooks/useOverviewMetrics";
import type { AvatarTone } from "../../components/Avatar";
import type { ReportSeverity } from "../../services/types";

const SEVERITY_AVATAR_TONE: Record<ReportSeverity, AvatarTone> = {
  high: "roseSoft",
  medium: "amberSoft",
};

function RangePill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[12px] border border-ink-100 bg-white px-3.5 py-2.5 text-[13px] text-ink-700">
      Last 30 days
      <Icon name="chevronDown" className="h-3.5 w-3.5 text-ink-400" />
    </span>
  );
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="mb-6 h-10 w-48 rounded-[12px] bg-ink-100" />
      <div className="mb-4 grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-2 max-[860px]:grid-cols-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[104px] rounded-[16px] border border-ink-100 bg-white" />
        ))}
      </div>
      <div className="h-[240px] rounded-[16px] border border-ink-100 bg-white" />
    </div>
  );
}

export function OverviewClient() {
  const { data, loading, error } = useOverviewMetrics();

  if (loading) return <OverviewSkeleton />;

  if (error) {
    return (
      <Card className="text-center text-ink-500">
        Couldn&apos;t load platform metrics. Refresh to try again.
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div>
      <AdminPageHeader
        crumb="Admin / Overview"
        title="Over"
        accent="view."
        subtitle="Platform health at a glance — users, revenue, and what needs attention."
        action={<RangePill />}
      />

      <div className="mb-[18px] grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-2 max-[860px]:grid-cols-1">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-[1.7fr_1fr] gap-4 max-[1100px]:grid-cols-1">
        <Card
          title="Signups & revenue"
          action={
            <span className="flex gap-4 text-xs text-ink-400">
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-indigo-500" />
                Signups
              </span>
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-green-500" />
                Revenue
              </span>
            </span>
          }
        >
          <TrendChart signups={data.signupsRevenueSeries.signups} revenue={data.signupsRevenueSeries.revenue} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Plan distribution">
            <DistributionBars slices={data.distribution} />
          </Card>
          <Card title="System status">
            <StatusList items={data.systemStatus} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-[860px]:grid-cols-1">
        <Card title="Recent signups">
          {data.recentSignups.map((signup) => (
            <RowItem
              key={signup.id}
              leading={<Avatar name={signup.name} tone="indigoSoft" />}
              title={signup.name}
              subtitle={signup.handle}
              trailing={
                <div className="flex items-center gap-2.5">
                  <PlanBadge plan={signup.plan} />
                  <span className="text-xs text-ink-300">{signup.when}</span>
                </div>
              }
            />
          ))}
        </Card>

        <Card title="Moderation queue">
          {data.moderationQueue.map((item) => (
            <RowItem
              key={item.id}
              leading={<Avatar content="!" tone={SEVERITY_AVATAR_TONE[item.severity]} />}
              title={item.handle}
              subtitle={`Reported: ${item.reason} · ${item.reports} ${item.reports === 1 ? "report" : "reports"}`}
              trailing={<SeverityBadge severity={item.severity} />}
            />
          ))}
        </Card>
      </div>
    </div>
  );
}
