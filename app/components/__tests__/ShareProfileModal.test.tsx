import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ShareProfileModal } from "../ShareProfileModal";

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("ShareProfileModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ShareProfileModal open={false} onClose={vi.fn()} profileUrl="https://linkhub.app/joel" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the title and profile URL when open", () => {
    render(
      <ShareProfileModal open onClose={vi.fn()} profileUrl="https://linkhub.app/joel" />
    );
    expect(screen.getByText("Share Profile")).toBeInTheDocument();
    expect(screen.getByText("https://linkhub.app/joel")).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(
      <ShareProfileModal open onClose={vi.fn()} profileUrl="x" title="Share My Page" />
    );
    expect(screen.getByText("Share My Page")).toBeInTheDocument();
  });

  it("calls navigator.clipboard.writeText with the URL on copy click", () => {
    render(
      <ShareProfileModal open onClose={vi.fn()} profileUrl="https://linkhub.app/joel" />
    );
    fireEvent.click(screen.getByText("Copy"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://linkhub.app/joel");
  });

  it("shows 'Copied!' after clicking the copy button", () => {
    render(
      <ShareProfileModal open onClose={vi.fn()} profileUrl="https://linkhub.app/joel" />
    );
    fireEvent.click(screen.getByText("Copy"));
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<ShareProfileModal open onClose={onClose} profileUrl="x" />);
    act(() => { fireEvent.click(screen.getByLabelText("Close")); });
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
