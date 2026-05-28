import { render, type RenderOptions } from "@testing-library/react";

/** No-op wrappers kept for backward compat with existing test imports. */
export function renderWithBranding(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, options);
}

export function renderWithSidebar(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, options);
}

export function renderWithSidebarAndBranding(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, options);
}
