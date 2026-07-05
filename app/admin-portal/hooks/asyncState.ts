/** Shared async state shape for the admin data hooks. */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
