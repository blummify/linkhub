import { Icon, type IconName } from "../icons";
import { AdminPageHeader } from "./AdminPageHeader";

export interface StubViewProps {
  crumb: string;
  title: string;
  accent?: string;
  icon: IconName;
  heading: string;
  description: string;
}

/** Routed empty state for admin views that aren't built out yet. */
export function StubView({ crumb, title, accent, icon, heading, description }: StubViewProps) {
  return (
    <div>
      <AdminPageHeader crumb={crumb} title={title} accent={accent} />
      <div className="grid min-h-[340px] place-items-center text-center text-ink-400">
        <div>
          <div className="mx-auto mb-3.5 grid h-[54px] w-[54px] place-items-center rounded-[12px] border border-ink-100 bg-white text-ink-300">
            <Icon name={icon} className="h-[26px] w-[26px]" />
          </div>
          <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl italic text-ink-700">
            {heading}
          </h3>
          <p className="mt-1.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
