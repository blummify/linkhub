import { z } from "zod";

const emailSchema = z.email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(6, "Minimum 6 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a number");

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

export const forgotPasswordSchema = z.object({
  email:emailSchema
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword:z.string().min(1, "Confirm Password is required"),
})
.refine((data) => data.password === data.confirmPassword, {
  message:"Passwords do not match",
  path:["confirmPassword"],
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
