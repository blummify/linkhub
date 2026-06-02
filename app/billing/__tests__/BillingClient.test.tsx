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
    render(<BillingClient />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("shows Upgrade CTA for a free user (null subscription)", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient />);
    await waitFor(() =>
      expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument()
    );
  });

  it("shows Cancel subscription for an active Pro user", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "pro",
      status: "active",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    render(<BillingClient />);
    await waitFor(() =>
      expect(screen.getByText(/cancel subscription/i)).toBeInTheDocument()
    );
  });

  it("shows Resume for a Pro user with cancelAtPeriodEnd=true", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "pro",
      status: "non-renewing",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: true,
    });
    render(<BillingClient />);
    await waitFor(() =>
      expect(screen.getByText(/resume/i)).toBeInTheDocument()
    );
  });

  it("shows the payment failed banner for a past_due subscription", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "pro",
      status: "past_due",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    render(<BillingClient />);
    await waitFor(() =>
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument()
    );
  });

  it("opens the plan change modal when Upgrade to Pro is clicked", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(<BillingClient />);

    await waitFor(() => screen.getByText(/upgrade to pro/i));
    fireEvent.click(screen.getByText(/upgrade to pro/i));

    await waitFor(() => screen.getByText(/confirm change/i));
    expect(screen.getByText(/confirm change/i)).toBeInTheDocument();
    expect(screen.getByText(/change plan/i)).toBeInTheDocument();
  });

  it("calls createCheckoutSession when a Pro user changes to Business", async () => {
    (getSubscription as ReturnType<typeof vi.fn>).mockResolvedValue({
      planId: "pro",
      status: "active",
      currentPeriodEnd: "2026-12-14T00:00:00Z",
      cancelAtPeriodEnd: false,
    });
    (createCheckoutSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: "https://checkout.paystack.com/test",
    });

    render(<BillingClient />);

    await waitFor(() => screen.getByText(/change plan/i));
    fireEvent.click(screen.getByText(/change plan/i));

    await waitFor(() => screen.getByText("Business"));
    fireEvent.click(screen.getByText("Business"));

    fireEvent.click(screen.getByText(/confirm change/i));

    await waitFor(() =>
      expect(createCheckoutSession).toHaveBeenCalled()
    );
  });
});
