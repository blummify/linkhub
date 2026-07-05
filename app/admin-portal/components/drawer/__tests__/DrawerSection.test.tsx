import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DrawerSection } from "../DrawerSection";

describe("DrawerSection", () => {
  it("renders a heading and its children", () => {
    render(
      <DrawerSection title="Account">
        <p>Body</p>
      </DrawerSection>
    );
    expect(screen.getByRole("heading", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
