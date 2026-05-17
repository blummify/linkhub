import "@testing-library/jest-dom";
import { vi } from "vitest";
import { createElement } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, className, style, onError }: any) =>
    createElement("img", { src, alt, width, height, className, style, onError }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className, onClick }: any) =>
    createElement("a", { href, className, onClick }, children),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */
