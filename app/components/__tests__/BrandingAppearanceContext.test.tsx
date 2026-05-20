import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  BrandingAppearanceProvider,
  useBrandingAppearance,
} from "../BrandingAppearanceContext";

function Probe() {
  const { state, setDisplayName, selectTheme, isDirty, hydrated } =
    useBrandingAppearance();
  return (
    <div>
      <span data-testid="hydrated">{String(hydrated)}</span>
      <span data-testid="name">{state.displayName}</span>
      <span data-testid="theme">{state.themeId}</span>
      <span data-testid="dirty">{String(isDirty)}</span>
      <button type="button" onClick={() => setDisplayName("Updated")}>
        rename
      </button>
      <button
        type="button"
        onClick={() =>
          selectTheme({
            id: "cream",
            name: "Cream",
            preview: {
              bg: "white",
              color: "#1a1a1a",
              avatarBg: "#1a1a1a",
              avatarColor: "white",
              btnBg: "transparent",
              btnColor: "#1a1a1a",
            },
            screen: { bgStyle: "white", dark: false, titleColor: "#1a1a1a" },
          })
        }
      >
        pick-cream
      </button>
    </div>
  );
}

describe("BrandingAppearanceContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides default branding state", async () => {
    render(
      <BrandingAppearanceProvider>
        <Probe />
      </BrandingAppearanceProvider>
    );
    expect(screen.getByTestId("name")).toHaveTextContent("Your Name");
    expect(screen.getByTestId("theme")).toHaveTextContent("monochrome");
  });

  it("marks dirty when state changes", async () => {
    render(
      <BrandingAppearanceProvider>
        <Probe />
      </BrandingAppearanceProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText("rename"));
    });
    expect(screen.getByTestId("dirty")).toHaveTextContent("true");
    expect(screen.getByTestId("name")).toHaveTextContent("Updated");
  });

  it("updates theme via selectTheme", async () => {
    render(
      <BrandingAppearanceProvider>
        <Probe />
      </BrandingAppearanceProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText("pick-cream"));
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("cream");
  });
});
