import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UserAvatar from "../UserAvatar";

describe("UserAvatar", () => {
  it("renders the first letter of the name as fallback", () => {
    render(<UserAvatar name="Joel Osei" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("uses the first letter of email when name is absent", () => {
    render(<UserAvatar email="alice@example.com" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders ? when neither name nor email is provided", () => {
    render(<UserAvatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders an img element when a valid src is given", () => {
    const { container } = render(<UserAvatar src="https://example.com/avatar.jpg" name="Joel" />);
    // alt="" makes the image role="presentation"; query the DOM directly
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("falls back to initials when the image fails to load", () => {
    const { container } = render(<UserAvatar src="https://broken.url/img.jpg" name="Joel" />);
    const img = container.querySelector("img")!;
    fireEvent.error(img);
    // After error the img is removed and the initials div is rendered
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("J")).toBeInTheDocument();
  });
});
