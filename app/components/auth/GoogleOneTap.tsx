"use client";

import { useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { signInWithGoogleOneTap } from "@/app/actions/auth";
import { isPublicHandleRoute } from "@/app/constants/reservedHandles";

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

export function GoogleOneTap({ clientId }: { clientId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCredential = useCallback(
    async ({ credential }: { credential: string }) => {
      const result = await signInWithGoogleOneTap(credential);
      if ("error" in result) {
        console.error("[OneTap]", result.error);
        return;
      }
      if ("requiresTwoFactor" in result) {
        router.push(`/login?2fa=${result.pendingToken}`);
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
    [router]
  );

  useEffect(() => {
    // Public profile pages (/{handle}) are a standalone visitor-facing surface —
    // don't prompt link clickers to sign in to the dashboard.
    if (!clientId || isPublicHandleRoute(pathname)) return;

    let addedScript: HTMLScriptElement | null = null;

    const initOneTap = () => {
      // Guard against multiple initialize() calls (React Strict Mode double-mount)
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });
      window.google.accounts.id.prompt();
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      // Script already in DOM — either loaded or loading
      if (window.google) {
        initOneTap();
      } else {
        existing.addEventListener("load", initOneTap, { once: true });
      }
    } else {
      addedScript = document.createElement("script");
      addedScript.src = "https://accounts.google.com/gsi/client";
      addedScript.async = true;
      addedScript.defer = true;
      addedScript.addEventListener("load", initOneTap, { once: true });
      document.head.appendChild(addedScript);
    }

    return () => {
      window.google?.accounts.id.cancel();
      // Only remove the script we added — not a pre-existing one
      if (addedScript && document.head.contains(addedScript)) {
        document.head.removeChild(addedScript);
      }
    };
  }, [clientId, handleCredential, pathname]);

  return null;
}
