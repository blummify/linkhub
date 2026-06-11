import { z } from "zod";

export const emailSchema = z.email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "Minimum 6 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[!@#$%^&*]/, "Must include at least one special character");
export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export function validateEmail(email: string): string {
  const result = emailSchema.safeParse(email);
  return result.success ? "" : result.error.issues[0].message;
}

export function validatePassword(password: string): string {
  const result = passwordSchema.safeParse(password);
  return result.success ? "" : result.error.issues[0].message;
}

// Shared confirm-password check (signup, reset, account).
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/** Confirm-field error message — empty string when the two match. */
export function validatePasswordMatch(password: string, confirmPassword: string): string {
  return passwordsMatch(password, confirmPassword) ? "" : "Passwords do not match";
}

// Strength score 0–4 for the password strength meter (signup, reset, account).
export function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score);
}

export const PASSWORD_STRENGTH_LABELS: Record<number, string> = {
  0: "—",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
