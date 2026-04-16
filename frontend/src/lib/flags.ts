/**
 * Runtime feature flags sourced from NEXT_PUBLIC_* env vars.
 *
 * MVP mode collapses the dashboard + Vow Chamber to their validation-test
 * surface: one primary tree, its daily quests, one Firekeeper line. All
 * progression chrome (level, streak badge, three-door grid, unlock hints)
 * is hidden. The backing code and data stay — this is a surface-only gate
 * so flipping `NEXT_PUBLIC_MVP_MODE=false` restores the full hub.
 *
 * Default is ON: while validating H2/H3, every confound we leave on screen
 * contaminates the test. Explicit opt-out only.
 */

export function isMvpMode(): boolean {
  return process.env.NEXT_PUBLIC_MVP_MODE !== "false";
}
