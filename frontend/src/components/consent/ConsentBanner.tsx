"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_CHANGE_EVENT,
  getConsent,
  setConsent,
  type ConsentValue,
} from "@/lib/consent";

/**
 * Fixed-bottom consent strip shown until the visitor chooses accept/decline.
 *
 * `undefined` = pre-hydration / pre-mount — we render nothing so the banner
 * never flashes for visitors who already accepted or declined on a previous
 * visit. After hydration we read the cookie (deferred one frame to satisfy
 * the React 19 Compiler rule on setState-in-effect) and show the banner
 * only when no decision is recorded yet.
 */
export function ConsentBanner() {
  const [consent, setConsentState] = useState<ConsentValue | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => setConsentState(getConsent()));
    const onChange = () => setConsentState(getConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    };
  }, []);

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie & analytics consent"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: "rgba(18, 18, 26, 0.96)",
        borderTop: "1px solid var(--border-default)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.45)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "0.85rem",
        lineHeight: 1.55,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "1rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
        className="consent-banner-inner"
      >
        <p style={{ margin: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              marginRight: "0.75rem",
            }}
          >
            ◆ A Note
          </span>
          We use Vercel Analytics and Speed Insights to understand how Duskvow
          is used. They set a small identifier on your device. You can decline
          and the app will keep working.{" "}
          <Link
            href="/privacy"
            style={{
              color: "var(--accent-gold)",
              textDecoration: "underline",
              textDecorationColor: "rgba(255, 215, 0, 0.4)",
            }}
          >
            Read the privacy policy
          </Link>
          .
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => setConsent("declined")}
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid rgba(224, 216, 200, 0.18)",
              padding: "0.65rem 1.6rem",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "rgba(224, 216, 200, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "rgba(224, 216, 200, 0.18)";
            }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-primary)",
              background: "linear-gradient(135deg, var(--accent-ember), #a03a28)",
              border: "none",
              padding: "0.65rem 1.8rem",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 28px rgba(200, 75, 17, 0.4), 0 0 56px rgba(200, 75, 17, 0.12)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "";
              e.currentTarget.style.transform = "";
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
