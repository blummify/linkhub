"use client";

import { useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Card } from "../../components/Card";
import { Icon } from "../../icons";
import { Field, INPUT_CLASS } from "./Field";
import { validateReservedHandle } from "./validation";

export interface ReservedHandlesCardProps {
  handles: string[];
  onAdd: (handle: string) => Promise<void>;
  onRemove: (handle: string) => Promise<void>;
}

export function ReservedHandlesCard({ handles, onAdd, onRemove }: ReservedHandlesCardProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const result = validateReservedHandle(draft, handles);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setBusy(true);
    try {
      await onAdd(result.handle);
      toast.success(`Reserved "${result.handle}"`, {
        description: "Change recorded in the audit log.",
      });
      setDraft("");
      setError(null);
    } catch {
      setError("Couldn't add that handle. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(handle: string) {
    try {
      await onRemove(handle);
      toast.success(`Removed "${handle}"`, { description: "Change recorded in the audit log." });
    } catch {
      toast.error("Couldn't remove that handle. Try again.");
    }
  }

  return (
    <Card title="Reserved handles">
      <p className="mb-3 text-[12.5px] leading-relaxed text-ink-400">
        Blocks users from claiming these handles and prevents collisions with app routes.
      </p>

      <div className="flex flex-wrap gap-2">
        {handles.length === 0 ? (
          <p className="text-[12.5px] text-ink-400">No reserved handles yet.</p>
        ) : (
          handles.map((handle) => (
            <span
              key={handle}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 py-1.5 pl-3 pr-2 text-[12.5px] text-ink-600"
            >
              {handle}
              <button
                type="button"
                onClick={() => remove(handle)}
                aria-label={`Remove ${handle}`}
                className="grid h-4 w-4 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-700 motion-reduce:transition-none"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>

      <Field
        label="Add a reserved handle"
        htmlFor="settings-reserved-handle"
        error={error}
        hint="3–24 letters, numbers, or underscores. Press Enter to add."
        className="mt-3.5"
      >
        <input
          id="settings-reserved-handle"
          value={draft}
          disabled={busy}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="e.g. checkout"
          aria-invalid={error !== null}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={submit}
          className={INPUT_CLASS}
        />
      </Field>
    </Card>
  );
}
