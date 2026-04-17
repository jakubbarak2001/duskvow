"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  CONSENT_CHANGE_EVENT,
  getConsent,
  type ConsentValue,
} from "@/lib/consent";

/**
 * Gates Vercel Analytics + Speed Insights behind an affirmative consent cookie.
 *
 * `undefined` = pre-hydration / pre-mount — render nothing so beacons do not
 * fire before we've checked the cookie. After mount we read the cookie once
 * and subscribe to future changes dispatched by `setConsent()`.
 *
 * The setState is deferred to the next animation frame so the React 19
 * Compiler rule `react-hooks/set-state-in-effect` is satisfied.
 */
export function ConsentGate() {
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

  if (consent !== "accepted") return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
