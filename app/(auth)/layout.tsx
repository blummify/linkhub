import type { Metadata } from "next";
import { RecaptchaScript } from "@/app/components/auth/RecaptchaScript";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RecaptchaScript />
      {children}
    </>
  );
}
