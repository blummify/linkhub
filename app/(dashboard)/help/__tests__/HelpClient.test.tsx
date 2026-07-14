import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpClient from "../HelpClient";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Alex", email: "alex@example.com" } },
    status: "authenticated",
    update: vi.fn(),
  }),
  signOut: vi.fn(),
}));

vi.mock("../user-admin/components/DashboardTopBar", () => ({
  DashboardTopBar: ({
    searchPlaceholder,
    searchValue,
    onSearchChange,
  }: {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
  }) => (
    <div>
      <input
        aria-label="Help search"
        placeholder={searchPlaceholder}
        value={searchValue ?? ""}
        onChange={(event) => onSearchChange?.(event.target.value)}
      />
    </div>
  ),
}));

describe("HelpClient", () => {
  it("renders hero, sections, and FAQ", { timeout: 15000 }, () => {
    render(<HelpClient />);
    expect(screen.getByRole("heading", { name: /how can we help/i })).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
    expect(screen.getByText("Go deeper")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /How do I publish a link/i })).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByText("Live chat")).toBeInTheDocument();
  });

  it("expands a FAQ row on click", () => {
    render(<HelpClient />);
    const q = screen.getByRole("button", { name: /How do I publish a link/i });
    expect(q).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Only published links appear/i)).toBeNull();

    fireEvent.click(q);

    expect(q).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Only published links appear/i)).toBeInTheDocument();
  });

  it("filters the FAQ via the search box and auto-opens matches", () => {
    render(<HelpClient />);
    const search = screen.getByPlaceholderText(/Search help articles/i);

    fireEvent.change(search, { target: { value: "payment" } });

    const match = screen.getByRole("button", { name: /update my payment method/i });
    expect(match).toHaveAttribute("aria-expanded", "true"); // auto-open while searching
    expect(screen.queryByRole("button", { name: /How do I publish a link/i })).toBeNull();
  });

  it("shows the empty state when nothing matches", () => {
    render(<HelpClient />);
    const search = screen.getByPlaceholderText(/Search help articles/i);

    fireEvent.change(search, { target: { value: "zzzznotathing" } });

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it("popular chips drive the search (multi-word, non-contiguous match)", () => {
    render(<HelpClient />);
    fireEvent.click(screen.getByRole("button", { name: "change theme" }));

    // "change theme" should match "How do I change my page theme?"
    expect(
      screen.getByRole("button", { name: /change my page theme/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /update my payment method/i })).toBeNull();
  });

  it("toggles an onboarding step", () => {
    render(<HelpClient />);
    const step = screen.getByRole("checkbox", { name: /Add your first link/i });
    expect(step).toHaveAttribute("aria-checked", "false");

    fireEvent.click(step);

    expect(step).toHaveAttribute("aria-checked", "true");
  });
});
