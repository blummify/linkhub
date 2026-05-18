import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthSessionProvider from "../AuthSessionProvider";

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AuthSessionProvider", () => {
  it("renders its children", () => {
    render(
      <AuthSessionProvider>
        <div>Child content</div>
      </AuthSessionProvider>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <AuthSessionProvider>
        <span>A</span>
        <span>B</span>
      </AuthSessionProvider>
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
