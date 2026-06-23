import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../ThemeToggle";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
    mockPathname = "/";
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

  it("does not render on a public profile (/{handle}) route", () => {
    mockPathname = "/aziz";
    render(<ThemeToggle />);
    expect(screen.queryByLabelText(/Switch to/i)).not.toBeInTheDocument();
  });

  it("still renders on a reserved-word route like /pricing", () => {
    mockPathname = "/pricing";
    render(<ThemeToggle />);
    expect(screen.getByLabelText(/Switch to/i)).toBeInTheDocument();
  });
});
