import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "../SiteFooter";

describe("SiteFooter", () => {
  it("renders the linkhub brand logo", () => {
    render(<SiteFooter />);
    expect(screen.getByText("linkhub")).toBeInTheDocument();
  });

  it("renders Company section links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Careers")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders Product section links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
  });

  it("renders Legal section links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders the copyright notice with the current year", () => {
    render(<SiteFooter />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${year} LinkHub`)),
    ).toBeInTheDocument();
  });

  it("renders inside a footer element", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
