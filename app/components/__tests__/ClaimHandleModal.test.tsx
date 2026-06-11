import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ClaimHandleModal } from "../ClaimHandleModal";

describe("ClaimHandleModal", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <ClaimHandleModal open={false} onClose={vi.fn()} onClaim={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the heading when open", () => {
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /claim your handle/i })).toBeInTheDocument();
  });

  it("shows the domain prefix", () => {
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={vi.fn()} />);
    expect(screen.getByText(/linkhub\.co\//)).toBeInTheDocument();
  });

  it("disables Continue button when handle is empty", () => {
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={vi.fn()} />);
    expect(screen.getByText("Continue to dashboard")).toBeDisabled();
  });

  it("disables Continue button when handle is too short (< 3 chars)", () => {
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "ab" } });
    expect(screen.getByText("Continue to dashboard")).toBeDisabled();
  });

  it("disables Continue button when handle has invalid characters", () => {
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "my handle!" } });
    expect(screen.getByText("Continue to dashboard")).toBeDisabled();
  });

  it("enables Continue button for a valid handle", () => {
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "valid_handle" } });
    expect(screen.getByText("Continue to dashboard")).not.toBeDisabled();
  });

  it("calls onClaim with the entered handle on submit", async () => {
    const onClaim = vi.fn().mockResolvedValue({ success: true });
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={onClaim} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "myhandle" } });
    fireEvent.click(screen.getByText("Continue to dashboard"));
    await waitFor(() => expect(onClaim).toHaveBeenCalledWith("myhandle"));
  });

  it("displays an error returned from onClaim", async () => {
    const onClaim = vi.fn().mockResolvedValue({ error: "Handle already taken" });
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={onClaim} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "takenone" } });
    fireEvent.click(screen.getByText("Continue to dashboard"));
    expect(await screen.findByText("Handle already taken")).toBeInTheDocument();
  });

  it("clears error when user types again after an error", async () => {
    const onClaim = vi.fn().mockResolvedValue({ error: "Handle already taken" });
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={onClaim} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "takenone" } });
    fireEvent.click(screen.getByText("Continue to dashboard"));
    await screen.findByText("Handle already taken");
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "takenone2" } });
    expect(screen.queryByText("Handle already taken")).not.toBeInTheDocument();
  });

  it("calls onClose when 'I'll do this later' is clicked", () => {
    const onClose = vi.fn();
    render(<ClaimHandleModal open onClose={onClose} onClaim={vi.fn()} />);
    act(() => { fireEvent.click(screen.getByText("I'll do this later")); });
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X close button is clicked", () => {
    const onClose = vi.fn();
    render(<ClaimHandleModal open onClose={onClose} onClaim={vi.fn()} />);
    act(() => { fireEvent.click(screen.getByLabelText("Close")); });
    fireEvent.animationEnd(screen.getByTestId("modal-panel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("submits on Enter key press in the input", async () => {
    const onClaim = vi.fn().mockResolvedValue({ success: true });
    render(<ClaimHandleModal open onClose={vi.fn()} onClaim={onClaim} />);
    fireEvent.change(screen.getByLabelText("Handle"), { target: { value: "myhandle" } });
    fireEvent.keyDown(screen.getByLabelText("Handle"), { key: "Enter" });
    await waitFor(() => expect(onClaim).toHaveBeenCalledWith("myhandle"));
  });
});
