"use client";

import { useRef, type KeyboardEvent } from "react";

const CODE_LENGTH = 6;

type TotpCodeInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  boxClassName: string;
  errorBoxClassName: string;
};

function toDigits(value: string): string[] {
  return Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? "");
}

function applyChange(
  digits: string[],
  index: number,
  raw: string
): { code: string; focus: number | null } {
  const typed = raw.replace(/\D/g, "");
  const next = digits.slice();

  if (typed.length <= 1) {
    next[index] = typed;
    return { code: next.join(""), focus: typed && index < CODE_LENGTH - 1 ? index + 1 : null };
  }

  typed.split("").forEach((char, offset) => {
    if (index + offset < CODE_LENGTH) next[index + offset] = char;
  });
  return { code: next.join(""), focus: Math.min(index + typed.length, CODE_LENGTH - 1) };
}

export function TotpCodeInput({
  id,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  boxClassName,
  errorBoxClassName,
}: TotpCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = toDigits(value);

  const focusBox = (index: number): void => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, raw: string): void => {
    const { code, focus } = applyChange(digits, index, raw);
    onChange(code);
    if (focus !== null) focusBox(focus);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = digits.slice();
      next[index - 1] = "";
      onChange(next.join(""));
      focusBox(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          id={index === 0 ? id : undefined}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
          maxLength={CODE_LENGTH}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`h-12 w-10 sm:w-12 rounded-lg border text-center text-lg font-mono outline-none transition focus:ring-2 ${
            error ? errorBoxClassName : boxClassName
          }`}
        />
      ))}
    </div>
  );
}
