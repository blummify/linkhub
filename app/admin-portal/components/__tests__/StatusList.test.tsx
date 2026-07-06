import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusList } from "../StatusList";

describe("StatusList", () => {
  it("renders each component with its status label and colour", () => {
    render(
      <StatusList
        items={[
          { name: "API", status: "operational" },
          { name: "Background jobs", status: "degraded" },
        ]}
      />
    );
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toHaveClass("text-green-500");
    expect(screen.getByText("Degraded")).toHaveClass("text-amber-500");
  });
});
