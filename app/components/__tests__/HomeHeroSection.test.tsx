import { describe, expect, it, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeHeroSection } from "../HomeHeroSection";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe("HomeHeroSection", () => {
  it("renders the headline text", () => {
    render(<HomeHeroSection />);
    expect(screen.getByText(/One Link,/i)).toBeInTheDocument();
  });

  it("renders the hero section element", () => {
    const { container } = render(<HomeHeroSection />);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders a sign-up call-to-action link", () => {
    render(<HomeHeroSection />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
