import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AvatarTone = "indigo" | "indigoSoft" | "roseSoft" | "amberSoft" | "greenSoft";
export type AvatarSize = "sm" | "md" | "lg";

const TONE_CLASSES: Record<AvatarTone, string> = {
  indigo: "bg-indigo-500 text-white",
  indigoSoft: "bg-indigo-50 text-indigo-500",
  roseSoft: "bg-danger-50 text-rose-500",
  amberSoft: "bg-amber-50 text-amber-500",
  greenSoft: "bg-success-50 text-green-500",
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-[34px] w-[34px] text-[13px]",
  md: "h-[38px] w-[38px] text-sm",
  lg: "h-[52px] w-[52px] text-[19px]",
};

export interface AvatarProps {
  /** Name the initial is derived from when `content` is not given. */
  name?: string;
  /** Explicit glyph (e.g. an icon character) instead of an initial. */
  content?: ReactNode;
  tone?: AvatarTone;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, content, tone = "indigo", size = "sm", className }: AvatarProps) {
  const initial = content ?? (name?.trim()?.[0]?.toUpperCase() || "?");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid flex-none place-items-center rounded-full font-semibold",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        className
      )}
    >
      {initial}
    </span>
  );
}
