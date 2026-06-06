import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencySelector } from "../CurrencySelector";

describe("CurrencySelector", () => {
  it("renders a combobox with the current value selected", () => {
    render(<CurrencySelector value="GHS" onChange={vi.fn()} />);
    const select = screen.getByRole("combobox", { name: /select currency/i });
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe("GHS");
  });

  it("lists all supported currencies as options", () => {
    render(<CurrencySelector value="USD" onChange={vi.fn()} />);
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThanOrEqual(8);
    expect(options.some((o) => o.textContent?.includes("USD"))).toBe(true);
    expect(options.some((o) => o.textContent?.includes("GHS"))).toBe(true);
  });

  it("calls onChange with the selected currency code", () => {
    const onChange = vi.fn();
    render(<CurrencySelector value="GHS" onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "USD" } });
    expect(onChange).toHaveBeenCalledWith("USD");
  });

  it("applies the className prop to the select element", () => {
    render(<CurrencySelector value="GHS" onChange={vi.fn()} className="custom-class" />);
    expect(screen.getByRole("combobox")).toHaveClass("custom-class");
  });
});
