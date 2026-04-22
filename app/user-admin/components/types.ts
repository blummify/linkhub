export interface ManagedLink {
  id?: string;
  title: string;
  url: string;
  /** Display string e.g. "1.2K" or "0" */
  clicks: string;
  draft?: boolean;
  icon?: string;
}
