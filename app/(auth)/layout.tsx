import { RecaptchaScript } from "@/app/components/auth/RecaptchaScript";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RecaptchaScript />
      {children}
    </>
  );
}
