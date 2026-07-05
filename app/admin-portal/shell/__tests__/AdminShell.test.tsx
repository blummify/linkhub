import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

import { AdminShell } from "../AdminShell";

const user = { name: "Ama Mensah", email: "ama@linkhub.app", role: "SUPER_ADMIN" };

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((media: string) => ({
    matches,
    media,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("AdminShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the sidebar, topbar, and content", () => {
    mockMatchMedia(false);
    render(
      <AdminShell user={user}>
        <p>Overview content</p>
      </AdminShell>
    );
    expect(screen.getByText("Overview content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Production")).toBeInTheDocument();
  });

  it("collapses the sidebar on desktop when the toggle is pressed", () => {
    mockMatchMedia(false);
    render(
      <AdminShell user={user}>
        <p>Body</p>
      </AdminShell>
    );
    const main = screen.getByRole("main").parentElement as HTMLElement;
    expect(main.style.marginLeft).toBe("248px");

    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(main.style.marginLeft).toBe("0px");
  });

  it("opens an overlay drawer on mobile and closes it on Escape", () => {
    mockMatchMedia(true);
    render(
      <AdminShell user={user}>
        <p>Body</p>
      </AdminShell>
    );
    expect(screen.queryByRole("button", { name: "Close navigation" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Close navigation" })).not.toBeInTheDocument();
  });
});
