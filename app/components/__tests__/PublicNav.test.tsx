import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicNav } from "../PublicNav";

describe("PublicNav", () => {
  it("renders the Login and Sign Up links", () => {
    render(<PublicNav />);
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("renders Features and Pricing nav links", () => {
    render(<PublicNav />);
    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toBeInTheDocument();
  });

  it("applies active styling to Features when activePage='features'", () => {
    render(<PublicNav activePage="features" />);
    const featuresLink = screen.getByRole("link", { name: "Features" });
    expect(featuresLink.className).toContain("border-primary");
  });

  it("applies active styling to Pricing when activePage='pricing'", () => {
    render(<PublicNav activePage="pricing" />);
    const pricingLink = screen.getByRole("link", { name: "Pricing" });
    expect(pricingLink.className).toContain("border-primary");
  });

  it("renders the logo image", () => {
    render(<PublicNav />);
    expect(screen.getByAltText("LinkHub logo")).toBeInTheDocument();
  });
});
