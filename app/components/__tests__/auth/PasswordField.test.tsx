import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordField } from "../../auth/PasswordField";

const baseProps = {
  id: "pw",
  label: "Password",
  value: "",
  onChange: vi.fn(),
  show: false,
  onToggleShow: vi.fn(),
};

describe("PasswordField", () => {
  it("renders the label and input", () => {
    render(<PasswordField {...baseProps} />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders as type=password when show is false", () => {
    render(<PasswordField {...baseProps} show={false} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("renders as type=text when show is true", () => {
    render(<PasswordField {...baseProps} show={true} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });

  it("calls onToggleShow when the visibility toggle button is clicked", () => {
    const onToggleShow = vi.fn();
    render(<PasswordField {...baseProps} onToggleShow={onToggleShow} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onToggleShow).toHaveBeenCalledOnce();
  });

  it("calls onChange when the user types", () => {
    const onChange = vi.fn();
    render(<PasswordField {...baseProps} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Secret1" } });
    expect(onChange).toHaveBeenCalledWith("Secret1");
  });

  it("displays an error message when error prop is set", () => {
    render(<PasswordField {...baseProps} error="Too short" />);
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });

  it("does not display strength meter when showStrength is false", () => {
    render(<PasswordField {...baseProps} value="Password1" showStrength={false} />);
    expect(screen.queryByText("Strong")).not.toBeInTheDocument();
  });

  it("shows Strong when all password criteria are met", () => {
    render(<PasswordField {...baseProps} value="Password1" showStrength />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("shows Weak for a short simple password", () => {
    render(<PasswordField {...baseProps} value="aaa" showStrength />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("shows Fair for a partially strong password", () => {
    render(<PasswordField {...baseProps} value="Password" showStrength />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
  });

  it("calls onBlur when the input loses focus", () => {
    const onBlur = vi.fn();
    render(<PasswordField {...baseProps} onBlur={onBlur} />);
    fireEvent.blur(screen.getByLabelText("Password"));
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("respects the optional name attribute", () => {
    render(<PasswordField {...baseProps} name="userPassword" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("name", "userPassword");
  });
});