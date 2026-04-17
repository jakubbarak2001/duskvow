/** Shared hero level/title helpers — single source of truth. */

const TITLE_THRESHOLDS = [
  { level: 5, title: "Oath-Bound" },
  { level: 10, title: "Ironsworn" },
  { level: 15, title: "Flamewarden" },
  { level: 20, title: "Duskwalker" },
  { level: 30, title: "Shadowforged" },
  { level: 40, title: "Mythbreaker" },
  { level: 50, title: "Vow Eternal" },
] as const;

/** Minimum total XP required to reach a given level.
 *
 *  This is the INVERSE of the server's `compute_level_from_xp` formula
 *  `level = floor(0.5 + sqrt(xp/25))`. Level 1 starts at 0 XP; for N >= 2
 *  the entry threshold is `ceil(25 * (N - 0.5)^2)`.
 *
 *  Entry thresholds (for reference, match the server):
 *    Lv  2 =      57 XP    Lv 10 =  2,257 XP
 *    Lv  3 =     157 XP    Lv 20 =  9,507 XP
 *    Lv  5 =     507 XP    Lv 50 = 61,257 XP
 *
 *  Before 2026-04-17 this returned `25 * N^2` which was the *midpoint* of
 *  each level, not the floor. The XP bar treated it as a floor, which made
 *  the progress percentage go negative at the start of a level and render
 *  as a fully-filled bar due to invalid CSS width. Fixed now.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.ceil(25 * (level - 0.5) * (level - 0.5));
}

/** Compute the level for a given total XP amount. Matches the server's
 *  `compute_level_from_xp` SQL function exactly. */
export function levelForXp(totalXp: number): number {
  return Math.max(1, Math.floor(0.5 + Math.sqrt(totalXp / 25)));
}

/** Hero title for a given level. */
export function titleForLevel(level: number): string {
  if (level >= 50) return "Vow Eternal";
  if (level >= 40) return "Mythbreaker";
  if (level >= 30) return "Shadowforged";
  if (level >= 20) return "Duskwalker";
  if (level >= 15) return "Flamewarden";
  if (level >= 10) return "Ironsworn";
  if (level >= 5) return "Oath-Bound";
  return "Wanderer";
}

/** Next title the hero will earn, or null if at max. */
export function nextTitleInfo(
  level: number,
): { title: string; atLevel: number } | null {
  for (const t of TITLE_THRESHOLDS) {
    if (t.level > level) return { title: t.title, atLevel: t.level };
  }
  return null;
}
