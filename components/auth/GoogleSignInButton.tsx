"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleAuth } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/AuthContext";
import { hasRole } from "@/lib/auth/roles";
import { ApiError } from "@/lib/api/client";
import type { UserRole } from "@/types/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Sign-In")), {
        once: true,
      });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

/** "Continue with Google" — renders Google's own button (via Identity
 *  Services) rather than a custom-styled lookalike, so the sign-in flow
 *  stays within Google's supported integration and branding. Silently
 *  renders nothing if NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't configured. */
export default function GoogleSignInButton({
  role,
  dashboardPath,
  onError,
}: {
  role: UserRole;
  dashboardPath: string;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const { setSession } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    async function handleCredentialResponse(response: { credential: string }) {
      try {
        const result = await googleAuth(response.credential, role);
        if (!hasRole(result.user, role)) {
          onError(
            `This account is registered as a ${result.user.role.toLowerCase()}. Use the ${
              result.user.role === "BUYER" ? "buyer" : "seller"
            } login instead.`
          );
          return;
        }
        setSession(result.token, result.user);
        router.push(dashboardPath);
      } catch (err) {
        onError(err instanceof ApiError ? err.message : "Google sign-in failed. Try again.");
      }
    }

    loadGsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredentialResponse });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: containerRef.current.clientWidth || 360,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, role, dashboardPath]);

  if (!clientId || failed) return null;

  return <div ref={containerRef} className="flex w-full justify-center" />;
}
