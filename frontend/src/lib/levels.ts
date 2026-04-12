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

/** XP required to reach a given level: 25 * level^2 */
export function xpForLevel(level: number): number {
  return 25 * level * level;
}

/** Compute the level for a given total XP amount. */
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
