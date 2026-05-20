import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhoneFrame } from "../PhoneFrame";

describe("PhoneFrame", () => {
  it("renders children inside the frame", () => {
    render(
      <PhoneFrame>
        <p>Preview content</p>
      </PhoneFrame>
    );
    expect(screen.getByText("Preview content")).toBeInTheDocument();
  });
});
