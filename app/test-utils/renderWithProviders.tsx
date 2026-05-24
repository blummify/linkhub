import { render, type RenderOptions } from "@testing-library/react";
import { BrandingAppearanceProvider } from "@/app/components/BrandingAppearanceContext";
import { SidebarProvider } from "@/app/components/SidebarContext";

export function renderWithBranding(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(<BrandingAppearanceProvider>{ui}</BrandingAppearanceProvider>, options);
}

export function renderWithSidebar(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(<SidebarProvider>{ui}</SidebarProvider>, options);
}

export function renderWithSidebarAndBranding(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(
    <SidebarProvider>
      <BrandingAppearanceProvider>{ui}</BrandingAppearanceProvider>
    </SidebarProvider>,
    options
  );
}
