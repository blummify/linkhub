"use client";

import { useEffect, useRef, type ReactNode } from "react";
import FocusTrap from "focus-trap-react";
import { useAuditLogEntry } from "../hooks/useAuditLogEntry";
import { formatDateTime } from "../format";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Icon } from "../icons";

export function AuditEntryModal({ entryId, onClose }: { entryId: string; onClose: () => void }) {
  const { data: entry, loading } = useAuditLogEntry(entryId);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-ink-900/50" aria-hidden="true" onClick={onClose} />
      <FocusTrap>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Audit entry"
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[calc(100vh-48px)] w-[480px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl"
        >
          <header className="flex items-start justify-between border-b border-ink-100 p-[22px]">
            <div>
              <div className="font-[family-name:var(--font-instrument-serif)] text-[25px] italic leading-none tracking-[-0.02em] text-ink-900">
                Audit entry
              </div>
              <div className="mt-1 font-[family-name:var(--font-geist-mono)] text-[13px] text-ink-400">
                {entry?.id ?? entryId}
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-ink-100 text-ink-500 hover:text-ink-700"
            >
              <Icon name="close" className="h-[15px] w-[15px]" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-[22px]">
            {loading && !entry ? (
              <p className="text-sm text-ink-400">Loading entry…</p>
            ) : !entry ? (
              <p className="text-sm text-ink-500">This entry could not be found.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Fact label="Actor" value={`${entry.actor.name} · ${entry.actor.role}`} />
                  <Fact
                    label="Action"
                    value={
                      <span className="flex items-center gap-2">
                        {entry.actionLabel}
                        {entry.sensitive && <Badge tone="rose">Sensitive</Badge>}
                      </span>
                    }
                  />
                  <Fact label="Target" value={entry.target} />
                  <Fact label="Time" value={formatDateTime(entry.createdAt)} />
                  <Fact label="IP address" value={entry.ip} mono />
                  <Fact label="Session" value={entry.session} mono />
                </div>

                {entry.changes && entry.changes.length > 0 ? (
                  <section className="mt-[18px]">
                    <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-400">
                      Changes
                    </h3>
                    <div className="divide-y divide-ink-100 rounded-[12px] border border-ink-100">
                      {entry.changes.map((change) => (
                        <div key={change.field} className="px-3.5 py-2.5 text-[13px]">
                          <div className="mb-1 text-ink-400">{change.field}</div>
                          <div className="text-ink-700">
                            <span className="text-ink-400 line-through">{change.before}</span>
                            {" → "}
                            <span className="font-medium text-ink-900">{change.after}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : entry.reason ? (
                  <section className="mt-[18px]">
                    <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-400">
                      Reason
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-ink-600">{entry.reason}</p>
                  </section>
                ) : null}
              </>
            )}
          </div>

          <footer className="flex justify-end border-t border-ink-100 p-[18px]">
            <Button onClick={onClose}>Close</Button>
          </footer>
        </div>
      </FocusTrap>
    </>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11.5px] text-ink-400">{label}</div>
      <div
        className={
          mono
            ? "mt-0.5 font-[family-name:var(--font-geist-mono)] text-[13px] font-medium text-ink-900"
            : "mt-0.5 text-sm font-medium text-ink-900"
        }
      >
        {value}
      </div>
    </div>
  );
}
