import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarProvider, useSidebar } from "../SidebarContext";

function TestConsumer() {
  const { isCollapsed, toggleSidebar, setIsCollapsed } = useSidebar();
  return (
    <div>
      <span data-testid="state">{isCollapsed ? "collapsed" : "expanded"}</span>
      <button onClick={toggleSidebar}>toggle</button>
      <button onClick={() => setIsCollapsed(true)}>force-collapse</button>
    </div>
  );
}

describe("SidebarProvider / useSidebar", () => {
  it("starts expanded by default", () => {
    render(<SidebarProvider><TestConsumer /></SidebarProvider>);
    expect(screen.getByTestId("state")).toHaveTextContent("expanded");
  });

  it("toggles to collapsed when toggleSidebar is called", () => {
    render(<SidebarProvider><TestConsumer /></SidebarProvider>);
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed");
  });

  it("toggles back to expanded on second call", () => {
    render(<SidebarProvider><TestConsumer /></SidebarProvider>);
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("state")).toHaveTextContent("expanded");
  });

  it("collapses directly via setIsCollapsed", () => {
    render(<SidebarProvider><TestConsumer /></SidebarProvider>);
    fireEvent.click(screen.getByText("force-collapse"));
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed");
  });

  it("throws when useSidebar is used outside a SidebarProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useSidebar must be used within a SidebarProvider"
    );
    spy.mockRestore();
  });
});
