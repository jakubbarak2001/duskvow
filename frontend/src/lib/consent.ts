/**
 * Consent state for cookie-setting SDKs (Vercel Analytics, Speed Insights).
 * Backed by a first-party cookie so the decision persists across sessions
 * without leaning on localStorage (per project rules).
 *
 * Three states:
 *   - null      : no decision yet — banner shows, SDKs do NOT fire.
 *   - "accepted": banner hidden, SDKs fire normally.
 *   - "declined": banner hidden, SDKs do NOT fire.
 */

export type ConsentValue = "accepted" | "declined";

const COOKIE_NAME = "duskvow_consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
export const CONSENT_CHANGE_EVENT = "duskvow:consent-changed";

export function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return null;
  const value = raw.split("=")[1];
  return value === "accepted" || value === "declined" ? value : null;
}

export function setConsent(value: ConsentValue): void {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${COOKIE_NAME}=${value}`,
    `Max-Age=${ONE_YEAR_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "Secure"
      : "",
  ]
    .filter(Boolean)
    .join("; ");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT));
  }
}
