"use client";

import { useEffect, useRef, useState } from "react";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  name?: string;
  error?: string;
  showStrength?: boolean;
  onBlur?: () => void;
};

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  if (score === 4) return { score, label: "Strong", barColor: "bg-green-500" };
  if (score === 3) return {  score, label: "Good", barColor: "bg-yellow-500" };
  if (score === 2) return { score, label: "Fair", barColor: "bg-orange-500" };
  return { score, label: "Weak", barColor: "bg-red-500" };
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder = "••••••••",
  name,
  error,
  showStrength,
  onBlur,
}: PasswordFieldProps) {
  const strength = showStrength && value ? getStrength(value) : null;

  const [criteriaVisible, setCriteriaVisible] = useState(true);
  const [animatingOut, setAnimatingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showStrength) return;
    const allMet = strength?.score === 4;

    if (allMet && criteriaVisible && !animatingOut) {
      queueMicrotask(() => setAnimatingOut(true));
      timerRef.current = setTimeout(() => {
        setCriteriaVisible(false);
        setAnimatingOut(false);
      }, 450);
    } else if (!allMet && !criteriaVisible) {
      queueMicrotask(() => setCriteriaVisible(true));
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strength?.score, showStrength]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-on-surface mb-2" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-surface-container-low dark:text-on-surface pr-12 ${
            error
              ? "border-red-400 dark:border-red-400"
              : "border-gray-300 dark:border-outline-variant"
          }`}
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-on-surface-variant cursor-pointer"
        >
          <span className="material-symbols-outlined">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {showStrength && value && strength && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= strength.score ? strength.barColor : "bg-gray-200 dark:bg-outline-variant"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-on-surface-variant mb-1">{strength.label}</p>
          {criteriaVisible && (
            <ul className={`space-y-0.5 ${animatingOut ? "animate-criteria-out" : "animate-criteria-in"}`}>
              {[
                { met: value.length >= 6, label: "At least 6 characters" },
                { met: /[A-Z]/.test(value), label: "One uppercase letter" },
                { met: /[0-9]/.test(value), label: "One number" },
                { met: /[!@#$%^&*]/.test(value), label: "At least one special character" },
              ].map((req) => (
                <li
                  key={req.label}
                  className={`text-xs flex items-center gap-1 ${req.met ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-on-surface-variant"}`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {req.met ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  {req.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
