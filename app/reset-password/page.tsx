import { AuthShell } from "@/app/components/auth/AuthShell";
import { validateResetToken } from "@/app/actions/auth";
import { ResetPasswordClient } from "./ResetPasswordClient";

const panelFeatures = [
  { icon: "link", title: "Unlimited Links", description: "Add as many links as you want to your profile without any restrictions." },
  { icon: "analytics", title: "Real-time Analytics", description: "Track clicks, views, and audience growth with detailed performance insights." },
  { icon: "palette", title: "Customizable Design", description: "Make your page truly yours with custom themes, fonts, and colors." },
];

export default async function NewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let initialState: "valid" | "invalid" | "used" | "expired" = "invalid";
  let tokenError = "";

  if (token) {
    const result = await validateResetToken(token);
    if ("valid" in result) {
      initialState = "valid";
    } else {
      tokenError = result.error;
      if (result.error.includes("already been used")) initialState = "used";
      else if (result.error.includes("expired")) initialState = "expired";
      else initialState = "invalid";
    }
  }

  return (
    <AuthShell
      heading="Set New Password"
      subheading="Create a strong password to secure your account and regain access to your dashboard."
      panelTitle="Connect Your World"
      panelDescription="Share all your important links in one beautiful place. Build your online presence and connect with your audience effortlessly."
      panelFeatures={panelFeatures}
    >
      <div className="space-y-6">
        <ResetPasswordClient
          token={token ?? null}
          initialState={initialState}
          tokenError={tokenError}
        />
      </div>
    </AuthShell>
  );
}
