import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  LinksIcon,
  BrandingIcon,
  AnalyticsIcon,
  HelpIcon,
  LogoutIcon,
} from "../SidebarIcons";

describe("SidebarIcons", () => {
  const icons = [
    ["LinksIcon", LinksIcon],
    ["BrandingIcon", BrandingIcon],
    ["AnalyticsIcon", AnalyticsIcon],
    ["HelpIcon", HelpIcon],
    ["LogoutIcon", LogoutIcon],
  ] as const;

  it.each(icons)("%s renders an svg", (_name, Icon) => {
    const { container } = render(<Icon className="w-4 h-4" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
