"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

/**
 * Supabase Auth UI form with dark fantasy appearance overrides.
 * Supports email/password login. Google OAuth must be enabled in Supabase
 * dashboard (Auth → Providers → Google) before adding it back to providers[].
 */
export function AuthForm() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : "/dashboard";

  return (
    <Auth
      supabaseClient={supabase}
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
