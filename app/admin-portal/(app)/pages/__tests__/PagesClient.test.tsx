import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("../../../components/drawer/PageDetailDrawer", () => ({
  PageDetailDrawer: ({ pageId }: { pageId: string; onClose: () => void }) => (
    <div role="dialog" aria-label="Page detail">
      drawer:{pageId}
    </div>
  ),
}));

import { PagesClient } from "../PagesClient";

describe("PagesClient", () => {
  it("renders the first page with a footer count", async () => {
    render(<PagesClient />);
    expect(await screen.findByText("@cryptodoubler")).toBeInTheDocument();
    expect(screen.getByText(/Showing 1-8 of 10/)).toBeInTheDocument();
  });

  it("filters rows by the suspended tab", async () => {
    render(<PagesClient />);
    await screen.findByText("@cryptodoubler");

    fireEvent.click(screen.getByRole("button", { name: "Suspended" }));

    await waitFor(() => expect(screen.queryByText("@cryptodoubler")).not.toBeInTheDocument());
    expect(screen.getByText("@free-giftcards")).toBeInTheDocument();
    expect(screen.getByText("@fiifimensah")).toBeInTheDocument();
  });

  it("searches by owner name", async () => {
    render(<PagesClient />);
    await screen.findByText("@cryptodoubler");

    fireEvent.change(screen.getByRole("searchbox", { name: "Search pages" }), {
      target: { value: "saraa" },
    });

    await waitFor(() => expect(screen.queryByText("@cryptodoubler")).not.toBeInTheDocument());
    expect(screen.getByText("@saraa")).toBeInTheDocument();
  });

  it("pages through results", async () => {
    render(<PagesClient />);
    await screen.findByText("@cryptodoubler");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(await screen.findByText("@akuasarpong")).toBeInTheDocument();
    expect(screen.queryByText("@cryptodoubler")).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 9-10 of 10/)).toBeInTheDocument();
  });

  it("opens the drawer for the clicked page", async () => {
    render(<PagesClient />);
    fireEvent.click(await screen.findByText("@cryptodoubler"));

    expect(await screen.findByText("drawer:page_cryptodoubler")).toBeInTheDocument();
  });
});
