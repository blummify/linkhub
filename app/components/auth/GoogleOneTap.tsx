"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signInWithGoogleOneTap } from "@/app/actions/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap() {
  const router = useRouter();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }: { credential: string }) => {
          const result = await signInWithGoogleOneTap(credential);
          if ("error" in result) {
            console.error("[OneTap]", result.error);
            return;
          }
          await signIn("credentials", {
            email: result.email,
            autoLoginToken: result.autoLoginToken,
            redirect: false,
            callbackUrl: "/user-dashboard",
          });
          router.replace("/user-dashboard");
        },
        auto_select: true,
        cancel_on_tap_outside: false,
        context: "signin",
      });

      window.google?.accounts.id.prompt();
    };

    document.head.appendChild(script);

    return () => {
      window.google?.accounts.id.cancel();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [router]);

  return null;
}
