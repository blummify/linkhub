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
  getInvoices,
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

  it("hides Next payment, Payment methods, Billing address, and Invoice history for a free user", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.queryByText(/upgrade/i)).toBeInTheDocument()
    );
    expect(screen.queryByText("Next payment")).not.toBeInTheDocument();
    expect(screen.queryByText("Payment methods")).not.toBeInTheDocument();
    expect(screen.queryByText("Billing address")).not.toBeInTheDocument();
    expect(screen.queryByText("Invoice history")).not.toBeInTheDocument();
  });

  it("shows free-plan usage caps (5 links, 1k views, no custom domains) for a free user", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getByText("3 / 5")).toBeInTheDocument()
    );
    expect(screen.getByText("750 / 1,000")).toBeInTheDocument();
    expect(screen.queryByText("Custom domains")).not.toBeInTheDocument();
  });

  it("shows all paid sections for an active Hub user with a card and invoice", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "hub",
      status: "active",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
      card: { brand: "visa", last4: "4242", expiry: "12/2028" },
    });
    (getInvoices as ReturnType<typeof vi.fn>).mockResolvedValue([{
      id: "inv_1",
      date: "14 Dec 2026",
      amount: "₵10.00",
      status: "success",
      pdfUrl: "https://example.com/receipt.pdf",
    }]);
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getByText("Next payment")).toBeInTheDocument()
    );
    expect(screen.getByText("Payment methods")).toBeInTheDocument();
    expect(screen.getByText("Billing address")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Invoice history")).toBeInTheDocument()
    );
  });

  it("shows real renewal date from subscription in PlanCard", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "hub",
      status: "active",
      currentPeriodEnd: "2027-03-01T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    render(<BillingClient defaultCurrency="GHS" />);
    await waitFor(() =>
      expect(screen.getByText(/march 1, 2027/i)).toBeInTheDocument()
    );
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
