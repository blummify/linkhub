import { Avatar } from "../components/Avatar";
import { EnvironmentBadge } from "../components/EnvironmentBadge";
import { Icon } from "../icons";

export interface AdminTopbarProps {
  userName: string;
  onToggleNav: () => void;
}

export function AdminTopbar({ userName, onToggleNav }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-ink-100 bg-paper px-7 py-3.5">
      <button
        type="button"
        onClick={onToggleNav}
        aria-label="Toggle navigation"
        className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[12px] border border-ink-100 bg-white text-ink-600 transition-colors hover:bg-paper motion-reduce:transition-none"
      >
        <Icon name="menu" className="h-[19px] w-[19px]" />
      </button>

      <div className="flex max-w-[520px] flex-1 items-center gap-2.5 rounded-[12px] border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink-400">
        <Icon name="search" className="h-[17px] w-[17px]" />
        <span>Search users, pages, handles…</span>
      </div>

      <EnvironmentBadge className="max-[860px]:hidden" />

      <button
        type="button"
        aria-label="Notifications"
        className="relative grid h-[38px] w-[38px] place-items-center rounded-full border border-ink-100 bg-white text-ink-500"
      >
        <Icon name="bell" className="h-[18px] w-[18px]" />
        <span className="absolute right-2.5 top-2.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-rose-500" />
      </button>

      <Avatar name={userName} tone="indigo" size="md" />
    </header>
  );
}
