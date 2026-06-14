import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TotpCodeInput } from "../../auth/TotpCodeInput";

const baseProps = {
  onChange: vi.fn(),
  boxClassName: "normal-class",
  errorBoxClassName: "error-class",
};

function getBoxes(): HTMLElement[] {
  return Array.from({ length: 6 }, (_, i) => screen.getByLabelText(`Digit ${i + 1} of 6`));
}

function Controlled({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <TotpCodeInput
      value={value}
      onChange={setValue}
      boxClassName="normal-class"
      errorBoxClassName="error-class"
    />
  );
}

describe("TotpCodeInput", () => {
  it("renders 6 single-digit input boxes", () => {
    render(<TotpCodeInput {...baseProps} value="" />);
    expect(getBoxes()).toHaveLength(6);
  });

  it("displays each character of the value in its own box", () => {
    render(<TotpCodeInput {...baseProps} value="123" />);
    const boxes = getBoxes();
    expect(boxes[0]).toHaveValue("1");
    expect(boxes[1]).toHaveValue("2");
    expect(boxes[2]).toHaveValue("3");
    expect(boxes[3]).toHaveValue("");
  });

  it("typing a digit updates the value and advances focus to the next box", () => {
    render(<Controlled />);
    const boxes = getBoxes();
    fireEvent.change(boxes[0], { target: { value: "5" } });
    expect(getBoxes()[0]).toHaveValue("5");
    expect(getBoxes()[1]).toHaveFocus();
  });

  it("ignores non-digit characters", () => {
    const onChange = vi.fn();
    render(<TotpCodeInput {...baseProps} value="" onChange={onChange} />);
    fireEvent.change(getBoxes()[0], { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("backspace on an empty box clears and focuses the previous box", () => {
    render(<Controlled initial="12" />);
    const boxes = getBoxes();
    fireEvent.keyDown(boxes[2], { key: "Backspace" });
    const updated = getBoxes();
    expect(updated[1]).toHaveValue("");
    expect(updated[1]).toHaveFocus();
    expect(updated[0]).toHaveValue("1");
  });

  it("ArrowLeft and ArrowRight navigate between boxes", () => {
    render(<Controlled initial="123456" />);
    const boxes = getBoxes();
    fireEvent.keyDown(boxes[2], { key: "ArrowLeft" });
    expect(getBoxes()[1]).toHaveFocus();
    fireEvent.keyDown(getBoxes()[1], { key: "ArrowRight" });
    expect(getBoxes()[2]).toHaveFocus();
  });

  it("pasting a full code distributes digits across all boxes", () => {
    render(<Controlled />);
    fireEvent.change(getBoxes()[0], { target: { value: "123456" } });
    const boxes = getBoxes();
    expect(boxes.map((b) => (b as HTMLInputElement).value)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(boxes[5]).toHaveFocus();
  });

  it("applies the error styling when error is true", () => {
    render(<TotpCodeInput {...baseProps} value="" error />);
    expect(getBoxes()[0]).toHaveClass("error-class");
    expect(getBoxes()[0]).not.toHaveClass("normal-class");
  });

  it("applies the normal styling when error is false", () => {
    render(<TotpCodeInput {...baseProps} value="" />);
    expect(getBoxes()[0]).toHaveClass("normal-class");
    expect(getBoxes()[0]).not.toHaveClass("error-class");
  });

  it("disables all boxes when disabled is true", () => {
    render(<TotpCodeInput {...baseProps} value="" disabled />);
    getBoxes().forEach((box) => expect(box).toBeDisabled());
  });

  it("applies the id prop only to the first box", () => {
    render(<TotpCodeInput {...baseProps} value="" id="totp-code" />);
    const boxes = getBoxes();
    expect(boxes[0]).toHaveAttribute("id", "totp-code");
    expect(boxes[1]).not.toHaveAttribute("id");
  });

  it("autofocuses the first box when autoFocus is true", () => {
    render(<TotpCodeInput {...baseProps} value="" autoFocus />);
    expect(getBoxes()[0]).toHaveFocus();
  });
});
