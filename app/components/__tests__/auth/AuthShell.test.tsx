import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthShell } from "../../auth/AuthShell";

vi.mock("next/script", () => ({
  default: ({ src }: { src: string }) => <div data-testid="recaptcha-script" data-src={src} />,
}));

const baseProps = {
  heading: "Sign In",
  subheading: "Welcome back",
  panelTitle: "Panel Title",
  panelDescription: "Panel description",
  panelFeatures: [] as { icon: string; title: string; description: string }[],
};

describe("AuthShell", () => {
  it("renders the heading and subheading", () => {
    render(<AuthShell {...baseProps}><div /></AuthShell>);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders children in the form area", () => {
    render(<AuthShell {...baseProps}><button>Submit</button></AuthShell>);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("renders an error message when error prop is provided", () => {
    render(<AuthShell {...baseProps} error="Invalid credentials"><div /></AuthShell>);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("does not render error section when error is absent", () => {
    const { container } = render(<AuthShell {...baseProps}><div /></AuthShell>);
    expect(container.querySelector(".bg-red-50")).toBeNull();
  });

  it("renders a link back to home when onBackClick is not provided", () => {
    render(<AuthShell {...baseProps}><div /></AuthShell>);
    expect(screen.getByRole("link", { name: /back to home/i })).toBeInTheDocument();
  });

  it("renders a button back to home when onBackClick is provided", () => {
    const onBackClick = vi.fn();
    render(<AuthShell {...baseProps} onBackClick={onBackClick}><div /></AuthShell>);
    const btn = screen.getByRole("button", { name: /back to home/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onBackClick).toHaveBeenCalledOnce();
  });

  it("renders the panel title and description", () => {
    render(<AuthShell {...baseProps}><div /></AuthShell>);
    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.getByText("Panel description")).toBeInTheDocument();
  });

  it("renders panel features", () => {
    const features = [
      { icon: "star", title: "Feature A", description: "Does something great" },
    ];
    render(<AuthShell {...baseProps} panelFeatures={features}><div /></AuthShell>);
    expect(screen.getByText("Feature A")).toBeInTheDocument();
    expect(screen.getByText("Does something great")).toBeInTheDocument();
  });

  describe("reCAPTCHA script", () => {
    const original = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    afterEach(() => {
      if (original === undefined) delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      else process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = original;
    });

    it("loads the reCAPTCHA script with the configured site key", () => {
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = "test-site-key";
      render(<AuthShell {...baseProps}><div /></AuthShell>);
      expect(screen.getByTestId("recaptcha-script")).toHaveAttribute(
        "data-src",
        "https://www.google.com/recaptcha/api.js?render=test-site-key"
      );
    });

    it("does not load the reCAPTCHA script when no site key is configured", () => {
      delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      render(<AuthShell {...baseProps}><div /></AuthShell>);
      expect(screen.queryByTestId("recaptcha-script")).toBeNull();
    });
  });

  describe("reCAPTCHA badge visibility", () => {
    afterEach(() => {
      document.querySelectorAll(".grecaptcha-badge").forEach((el) => el.remove());
    });

    it("shows the badge while mounted and hides it on unmount", () => {
      const badge = document.createElement("div");
      badge.className = "grecaptcha-badge";
      badge.style.display = "none";
      document.body.appendChild(badge);

      const { unmount } = render(<AuthShell {...baseProps}><div /></AuthShell>);
      expect(badge.style.display).toBe("");

      unmount();
      expect(badge.style.display).toBe("none");
    });
  });
});
