import { describe, expect, it, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AvatarCropModal } from "../AvatarCropModal";

vi.mock("react-image-crop", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="react-crop">{children}</div>,
  centerCrop: vi.fn((c) => c),
  makeAspectCrop: vi.fn(() => ({ unit: "%", width: 80, height: 80, x: 10, y: 10 })),
}));

beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => "blob:mock");
  globalThis.URL.revokeObjectURL = vi.fn();
});

const makeFile = () => new File(["img"], "photo.jpg", { type: "image/jpeg" });

describe("AvatarCropModal", () => {
  it("renders the crop modal with title and save button", () => {
    render(
      <AvatarCropModal
        file={makeFile()}
        name="Alex"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Crop photo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save image/i })).toBeInTheDocument();
  });

  it("calls onCancel when the X button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <AvatarCropModal file={makeFile()} onConfirm={vi.fn()} onCancel={onCancel} />
    );
    // X button is the only button in the header area — identify by its svg child
    const closeBtn = screen.getAllByRole("button").find(
      (b) => b.querySelector("svg path[d*='M18 6']")
    );
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onCancel when the backdrop is clicked", () => {
    const onCancel = vi.fn();
    const { container } = render(
      <AvatarCropModal file={makeFile()} onConfirm={vi.fn()} onCancel={onCancel} />
    );
    // backdrop is the absolute inset-0 div directly inside the modal root
    const backdrop = container.querySelector(".absolute.inset-0.bg-black\\/50");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCancel).toHaveBeenCalled();
  });

  it("renders the shape picker buttons", () => {
    render(
      <AvatarCropModal file={makeFile()} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByTitle("Circle")).toBeInTheDocument();
    expect(screen.getByTitle("Square")).toBeInTheDocument();
    expect(screen.getByTitle("Rect")).toBeInTheDocument();
  });

  it("save button is disabled when no crop has been completed", () => {
    render(
      <AvatarCropModal file={makeFile()} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /save image/i })).toBeDisabled();
  });

  it("shows the user initial in preview when no previewUrl", () => {
    render(
      <AvatarCropModal file={makeFile()} name="Jordan" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
