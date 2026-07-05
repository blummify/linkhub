import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Body</Card>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders an optional title and action", () => {
    render(
      <Card title="Plan distribution" action={<button type="button">View all</button>}>
        Body
      </Card>
    );
    expect(screen.getByText("Plan distribution")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View all" })).toBeInTheDocument();
  });
});
