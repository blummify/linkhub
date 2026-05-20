import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobilePreview, DEFAULT_APPEARANCE } from "../MobilePreview";

describe("MobilePreview", () => {
  it("renders profile title and bio", () => {
    render(
      <MobilePreview
        appearance={{
          ...DEFAULT_APPEARANCE,
          profileTitle: "Alex Rivera",
          profileBio: "Creator & designer",
        }}
        showHeaderChrome={false}
        showPublicUrlBar={false}
        showDeviceFooter={false}
      />
    );
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("Creator & designer")).toBeInTheDocument();
  });

  it("applies button shape to link card border radius", () => {
    const { container, rerender } = render(
      <MobilePreview
        appearance={{
          ...DEFAULT_APPEARANCE,
          buttonRoundness: "square",
        }}
        linkRows={[{ kind: "button", title: "Portfolio", url: "https://x.com" }]}
        showHeaderChrome={false}
        showPublicUrlBar={false}
        showDeviceFooter={false}
      />
    );
    const link = container.querySelector(".preview-card-btn");
    expect(link?.className).toContain("rounded-none");

    rerender(
      <MobilePreview
        appearance={{
          ...DEFAULT_APPEARANCE,
          buttonRoundness: "pill",
        }}
        linkRows={[{ kind: "button", title: "Portfolio", url: "https://x.com" }]}
        showHeaderChrome={false}
        showPublicUrlBar={false}
        showDeviceFooter={false}
      />
    );
    expect(container.querySelector(".preview-card-btn")?.className).toContain(
      "rounded-full"
    );
  });

  it("renders link rows when provided", () => {
    render(
      <MobilePreview
        appearance={DEFAULT_APPEARANCE}
        linkRows={[{ kind: "button", title: "Portfolio", url: "https://x.com" }]}
        showHeaderChrome={false}
        showPublicUrlBar={false}
        showDeviceFooter={false}
      />
    );
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("shows header chrome when enabled", () => {
    render(
      <MobilePreview
        appearance={DEFAULT_APPEARANCE}
        headerTitle="Live Preview"
        showPublicUrlBar={false}
        showDeviceFooter={false}
      />
    );
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
  });

  it("calls onShareBarClick when URL bar is clicked", () => {
    const onShareBarClick = vi.fn();
    render(
      <MobilePreview
        appearance={DEFAULT_APPEARANCE}
        publicUrl="linkhub.co/test"
        onShareBarClick={onShareBarClick}
        showHeaderChrome
        showDeviceFooter={false}
      />
    );
    fireEvent.click(screen.getByText("linkhub.co/test"));
    expect(onShareBarClick).toHaveBeenCalledOnce();
  });
});
