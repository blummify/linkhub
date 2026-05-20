import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText(/Switch to/i)).toBeInTheDocument();
  });

  it("toggles dark class on document", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText(/Switch to dark mode/i));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
