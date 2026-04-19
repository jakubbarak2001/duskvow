"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  CONSENT_CHANGE_EVENT,
  getConsent,
  type ConsentValue,
} from "@/lib/consent";

const CLARITY_PROJECT_ID = "we1p6f1d9b";

/**
 * Gates Vercel Analytics + Speed Insights + Microsoft Clarity behind an
 * affirmative consent cookie.
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
      <Script id="ms-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `}
      </Script>
    </>
  );
}
