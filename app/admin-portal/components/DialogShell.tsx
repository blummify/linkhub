"use client";

import { useEffect, type ReactNode } from "react";
import FocusTrap from "focus-trap-react";
import { cn } from "@/lib/cn";

export interface DialogShellProps {
    open: boolean;
    ariaLabel: string;
    role?: "dialog" | "alertdialog";
    locked?: boolean;
    onClose: () => void;
    widthClassName?: string;
    children: ReactNode;
}

/**
 * Both ConfirmDialog and InviteAdminModal render inside this 
 */
export function DialogShell({
    open,
    ariaLabel,
    role = "dialog",
    locked = false,
    onClose,
    widthClassName = "w-[420px]",
    children,
}: DialogShellProps) {
    useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape" && !locked) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    }, [open, locked, onClose]);

    if (!open) return null;

    return (
    <>
        <div
            className="fixed inset-0 z-[100] bg-ink-900/50 backdrop-blur-md"
            aria-hidden="true"
            onClick={locked ? undefined : onClose}
        />  
        <FocusTrap>
        <div
            role={role}
            aria-modal="true"
            aria-label={ariaLabel}
                className={cn(
                "fixed left-1/2 top-1/2 z-[101] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-white p-5 shadow-2xl",
                widthClassName
            )}
        >
            {children}
        </div>
        </FocusTrap>
    </>
    );
}