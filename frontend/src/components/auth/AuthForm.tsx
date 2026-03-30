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
              brandAccent: "#a03a28",
              brandButtonText: "#ffffff",
              defaultButtonBackground: "#242430",
              defaultButtonBackgroundHover: "#2E2E3A",
              defaultButtonBorder: "rgba(224, 216, 200, 0.1)",
              defaultButtonText: "#E0D8C8",
              dividerBackground: "rgba(224, 216, 200, 0.08)",
              inputBackground: "#0A0A12",
              inputBorder: "rgba(224, 216, 200, 0.12)",
              inputBorderHover: "rgba(200, 75, 17, 0.6)",
              inputBorderFocus: "#FFD700",
              inputText: "#E0D8C8",
              inputLabelText: "#A09888",
              inputPlaceholder: "#6B6358",
              messageText: "#A09888",
              messageTextDanger: "#c0524b",
              anchorTextColor: "rgba(255, 215, 0, 0.8)",
              anchorTextHoverColor: "#FFD700",
            },
            radii: {
              borderRadiusButton: "2px",
              buttonBorderRadius: "2px",
              inputBorderRadius: "2px",
            },
            space: {
              inputPadding: "0.85rem 1rem",
              buttonPadding: "1rem 2rem",
            },
            fontSizes: {
              baseBodySize: "14px",
              baseInputSize: "14px",
              baseLabelSize: "11px",
              baseButtonSize: "13px",
            },
            fonts: {
              bodyFontFamily: `var(--font-inter), "Inter", sans-serif`,
              buttonFontFamily: `var(--font-cinzel), "Cinzel", serif`,
              inputFontFamily: `var(--font-inter), "Inter", sans-serif`,
              labelFontFamily: `var(--font-cinzel), "Cinzel", serif`,
            },
          },
        },
        className: {
          button: "auth-submit-btn",
          label: "auth-label",
          input: "auth-input",
        },
      }}
      providers={["google"]}
      redirectTo={redirectTo}
      theme="default"
    />
  );
}
