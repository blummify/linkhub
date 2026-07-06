import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RowItem } from "../RowItem";

describe("RowItem", () => {
  it("renders title, subtitle, and trailing slots", () => {
    render(
      <RowItem
        leading={<span>AV</span>}
        title="Kofi Twum"
        subtitle="@kofitwum"
        trailing={<span>2m ago</span>}
      />
    );
    expect(screen.getByText("Kofi Twum")).toBeInTheDocument();
    expect(screen.getByText("@kofitwum")).toBeInTheDocument();
    expect(screen.getByText("2m ago")).toBeInTheDocument();
    expect(screen.getByText("AV")).toBeInTheDocument();
  });

  it("omits the subtitle when not provided", () => {
    render(<RowItem title="Only title" />);
    expect(screen.getByText("Only title")).toBeInTheDocument();
  });
});
