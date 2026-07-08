import type { ReactNode } from "react";

export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-400">
        {title}
      </h3>
      {children}
    </section>
  );
}
