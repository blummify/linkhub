import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LinksStyleTwoColumnLayout } from "../LinksStyleTwoColumnLayout";

describe("LinksStyleTwoColumnLayout", () => {
  it("renders left and preview columns", () => {
    render(
      <LinksStyleTwoColumnLayout
        left={<div>Editor panel</div>}
        preview={<div>Phone preview</div>}
      />
    );
    expect(screen.getByText("Editor panel")).toBeInTheDocument();
    expect(screen.getByText("Phone preview")).toBeInTheDocument();
  });
});
