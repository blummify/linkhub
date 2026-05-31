import "@testing-library/jest-dom";
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Assertion, AsymmetricMatchersContaining } from "vitest";

interface CustomMatchers<R = void> {
  toBeInTheDocument(): R;
  toHaveAttribute(attr: string, value?: string | RegExp): R;
  toHaveClass(className: string): R;
  toHaveStyle(css: string | Record<string, unknown>): R;
  toHaveTextContent(text: string | RegExp): R;
  toHaveValue(value: string | number | string[]): R;
  toBeVisible(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toBeEmpty(): R;
  toBeInvalid(): R;
  toBeValid(): R;
  toBeRequired(): R;
  toBePartiallyChecked(): R;
  toBeChecked(): R;
  toHaveFocus(): R;
  toHaveFormValues(values: Record<string, unknown>): R;
  toBeEmptyDOMElement(): R;
  toContainElement(element: HTMLElement | SVGElement | null): R;
  toContainHTML(html: string): R;
  toHaveErrorMessage(message: string): R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomMatchers<boolean> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers<boolean> {}
}
