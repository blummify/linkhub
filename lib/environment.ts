/**
 * Deployment environment for the admin surface, derived from an env var so the
 * environment badge is never hardcoded. Production is the cautious default when
 * the value is unset or unrecognised, so staff are never falsely told a session
 * is non-production.
 *
 * Set NEXT_PUBLIC_ADMIN_ENV to "production" | "staging" | "development".
 * Optionally override the displayed text with NEXT_PUBLIC_ADMIN_ENV_LABEL.
 */

export type Environment = "production" | "staging" | "development";

const KNOWN: readonly Environment[] = ["production", "staging", "development"];

const DEFAULT_LABELS: Record<Environment, string> = {
  production: "Production",
  staging: "Staging",
  development: "Development",
};

export interface EnvironmentConfig {
  name: Environment;
  label: string;
}

function normalizeName(raw: string | undefined): Environment {
  const value = (raw ?? "").trim().toLowerCase();
  return (KNOWN as readonly string[]).includes(value)
    ? (value as Environment)
    : "production";
}

/**
 * Build the environment config from raw values. Accepts an explicit source so
 * it can be unit-tested without mutating `process.env`; defaults to the
 * `NEXT_PUBLIC_ADMIN_ENV*` vars.
 */
export function readEnvironment(
  source: { name?: string; label?: string } = {
    name: process.env.NEXT_PUBLIC_ADMIN_ENV,
    label: process.env.NEXT_PUBLIC_ADMIN_ENV_LABEL,
  }
): EnvironmentConfig {
  const name = normalizeName(source.name);
  const label = source.label?.trim() || DEFAULT_LABELS[name];
  return { name, label };
}

export const environment: EnvironmentConfig = readEnvironment();
