import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UpgradeCard from "../UpgradeCard";

import { mockRouterPush } from "../../../vitest.setup";

describe("UpgradeCard", () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
  });
  it("renders nothing when collapsed", () => {
    const { container } = render(<UpgradeCard isCollapsed />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders pro copy and navigates to pricing", () => {
    render(<UpgradeCard isCollapsed={false} />);
    expect(screen.getByText("LinkHub Pro")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Upgrade/));
    expect(mockRouterPush).toHaveBeenCalledWith("/pricing");
  });
});
