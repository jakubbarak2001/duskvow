"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Supabase Auth UI form with dark fantasy appearance overrides.
 * Supports email/password login. Google OAuth must be enabled in Supabase
 * dashboard (Auth → Providers → Google) before adding it back to providers[].
 */
export function AuthForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;

    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [router, configured]);

  if (!configured) {
    return (
      <div
        className="p-4 rounded text-center text-sm"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-secondary)",
          border: "1px solid rgba(200, 75, 17, 0.4)",
        }}
      >
        <p className="font-bold mb-2" style={{ color: "var(--accent-ember)" }}>
          Authentication Unavailable
        </p>
        <p>
          Supabase environment variables were not found in this build.
          Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
          are set in the deployment platform.
        </p>
      </div>
    );
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : "/dashboard";

  return (
    <Auth
      supabaseClient={getSupabase()}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: "#C84B11",
              brandAccent: "#FFD700",
              brandButtonText: "#E0D8C8",
              defaultButtonBackground: "#242430",
              defaultButtonBackgroundHover: "#2E2E3A",
              defaultButtonBorder: "rgba(224, 216, 200, 0.1)",
              defaultButtonText: "#E0D8C8",
              dividerBackground: "rgba(224, 216, 200, 0.1)",
              inputBackground: "#12121A",
              inputBorder: "rgba(224, 216, 200, 0.1)",
              inputBorderHover: "#C84B11",
              inputBorderFocus: "#FFD700",
              inputText: "#E0D8C8",
              inputLabelText: "#A09888",
              inputPlaceholder: "#6B6358",
              messageText: "#A09888",
              messageTextDanger: "#8B0000",
              anchorTextColor: "#FFD700",
              anchorTextHoverColor: "#C84B11",
            },
            radii: {
              borderRadiusButton: "4px",
              buttonBorderRadius: "4px",
              inputBorderRadius: "4px",
            },
            fontSizes: {
              baseBodySize: "14px",
              baseInputSize: "14px",
              baseLabelSize: "12px",
              baseButtonSize: "14px",
            },
          },
        },
      }}
      providers={[]}
      redirectTo={redirectTo}
      theme="default"
    />
  );
}
