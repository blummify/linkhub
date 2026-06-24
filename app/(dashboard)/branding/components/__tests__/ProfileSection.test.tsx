import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileSection } from "../ProfileSection";

describe("ProfileSection", () => {
  const props = {
    displayName: "Alex Rivera",
    handle: "alex",
    bio: "Hello world",
    onDisplayNameChange: vi.fn(),
    onHandleChange: vi.fn(),
    onBioChange: vi.fn(),
  };

  it("renders profile fields and public URL hint", () => {
    render(<ProfileSection {...props} />);
    expect(screen.getByDisplayValue("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alex")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
    expect(screen.getByText(/getlinkhub.app\/alex/)).toBeInTheDocument();
  });

  it("calls change handlers on input", () => {
    render(<ProfileSection {...props} />);
    fireEvent.change(screen.getByDisplayValue("Alex Rivera"), {
      target: { value: "New Name" },
    });
    expect(props.onDisplayNameChange).toHaveBeenCalledWith("New Name");
  });
});
