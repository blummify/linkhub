import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicCtaActions } from "../PublicCtaActions";

describe("PublicCtaActions", () => {
  it("renders default labels", () => {
    render(<PublicCtaActions primaryClassName="" secondaryClassName="" />);
    expect(screen.getByText("Get Started for Free")).toBeInTheDocument();
    expect(screen.getByText("Book a Demo")).toBeInTheDocument();
  });

  it("renders custom labels", () => {
    render(
      <PublicCtaActions
        primaryClassName=""
        secondaryClassName=""
        primaryLabel="Try Free"
        secondaryLabel="Learn More"
      />
    );
    expect(screen.getByText("Try Free")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("renders two buttons", () => {
    render(<PublicCtaActions primaryClassName="" secondaryClassName="" />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
