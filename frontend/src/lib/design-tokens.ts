/**
 * Hex mirrors of the design-token CSS variables defined in globals.css.
 *
 * CSS custom properties are the source of truth for runtime UI styling —
 * every component should use `var(--token)`. This module exists only for
 * contexts that render *without* a CSS stylesheet, specifically:
 *
 *   - next/og ImageResponse (edge runtime, no <style> injection)
 *   - Potential future: transactional emails, server-generated PDFs
 *
 * Keep values in sync with the tokens in app/globals.css.
 */

export const designTokens = {
  bgAbyss: "#0A0A12",
  bgShadow: "#12121A",
  bgElevated: "#1C1C26",
  bgHighlight: "#2E2E3A",

  textPrimary: "#E0D8C8",
  textSecondary: "#A09888",
  textMuted: "#6B6358",

  accentEmber: "#C84B11",
  accentGold: "#FFD700",
  accentBlood: "#8B0000",
} as const;
