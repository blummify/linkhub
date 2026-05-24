import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickTuneSection } from "../QuickTuneSection";

describe("QuickTuneSection", () => {
  const props = {
    accentColor: "#3b46e0",
    buttonStyle: "rounded",
    fontFamily: "Instrument Serif",
    onAccentColorChange: vi.fn(),
    onButtonStyleChange: vi.fn(),
    onFontFamilyChange: vi.fn(),
  };

  it("renders accent, button shape, and font options", () => {
    render(<QuickTuneSection {...props} />);
    expect(screen.getByText(/Accent color/i)).toBeInTheDocument();
    expect(screen.getByText("Rounded")).toBeInTheDocument();
    expect(screen.getByText(/Heading font/i)).toBeInTheDocument();
  });

  it("calls onFontFamilyChange when a font is selected", () => {
    render(<QuickTuneSection {...props} />);
    fireEvent.click(screen.getByText("Geist"));
    expect(props.onFontFamilyChange).toHaveBeenCalledWith("Geist");
  });
});
