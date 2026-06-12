import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BillingClient from "../BillingClient";

/* ── Infrastructure mocks ── */
vi.mock("@/app/components/CollapsibleSidebar", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/store/sidebarStore", () => ({
  useSidebarStore: () => false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/billing",
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn() }),
}));

/* ── Billing action mocks ── */
vi.mock("@/app/actions/billing", () => ({
  getSubscription: vi.fn(),
  getInvoices:     vi.fn().mockResolvedValue([]),
  createCheckoutSession: vi.fn(),
  cancelSubscription:    vi.fn(),
}));

import {
  getSubscription,
  createCheckoutSession,
} from "@/app/actions/billing";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BillingClient", () => {
  it("renders the main element", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient defaultCurrency="GHS" />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("shows Upgrade CTA for a free user (null subscription)", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getAllByText(/upgrade/i).length).toBeGreaterThan(0)
    );
  });

  it("shows Cancel subscription for an active Hub user", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "hub",
      status: "active",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getByText(/cancel subscription/i)).toBeInTheDocument()
    );
  });

  it("shows Resume for a Hub user with cancelAtPeriodEnd=true", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "hub",
      status: "non-renewing",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: true,
    });
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getByText(/resume/i)).toBeInTheDocument()
    );
  });

  it("shows the payment failed banner for a past_due subscription", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "hub",
      status: "past_due",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument()
    );
  });

  it("opens the plan change modal when Upgrade is clicked", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient defaultCurrency="GHS" />);

    await waitFor(() => screen.getAllByText("Upgrade"));
    fireEvent.click(screen.getAllByText("Upgrade")[0]);

    await waitFor(() => screen.getByText(/confirm change/i));
    expect(screen.getByText(/confirm change/i)).toBeInTheDocument();
    expect(screen.getByText(/change plan/i)).toBeInTheDocument();
  });

  it("calls createCheckoutSession when a Hub user changes to Studio", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "hub",
      status: "active",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    (createCheckoutSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: "https://checkout.paystack.com/test",
    });

    render(<BillingClient defaultCurrency="GHS" />);

    await waitFor(() => screen.getAllByText("Change plan"));
    fireEvent.click(screen.getAllByText("Change plan")[0]);

    await waitFor(() => screen.getByText("Studio"));
    fireEvent.click(screen.getByText("Studio"));

    fireEvent.click(screen.getByText(/confirm change/i));

    await waitFor(() =>
      expect(createCheckoutSession).toHaveBeenCalled()
    );
  });
});
