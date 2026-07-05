import { cn } from "@/lib/cn";
import { environment, type Environment, type EnvironmentConfig } from "@/lib/environment";

const VARIANT_CLASSES: Record<Environment, string> = {
  production: "bg-success-50 text-green-500 border-green-500/30",
  staging: "bg-amber-50 text-amber-500 border-amber-500/30",
  development: "bg-danger-50 text-rose-500 border-rose-500/30",
};

const DOT_CLASSES: Record<Environment, string> = {
  production: "bg-green-500",
  staging: "bg-amber-500",
  development: "bg-rose-500",
};

/**
 * Environment indicator for the topbar. Colour and label come from
 * {@link environment} (an env var), so production is unmistakable and
 * non-production is visibly different. Accepts an explicit `env` for testing.
 */
export function EnvironmentBadge({
  env = environment,
  className,
}: {
  env?: EnvironmentConfig;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold",
        VARIANT_CLASSES[env.name],
        className
      )}
    >
      <span className={cn("h-[7px] w-[7px] rounded-full", DOT_CLASSES[env.name])} />
      {env.label}
    </span>
  );
}
