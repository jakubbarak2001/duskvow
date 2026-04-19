import { ImageResponse } from "next/og";
import { designTokens as T } from "@/lib/design-tokens";

export const runtime = "edge";
export const alt = "A vow on Duskvow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface OgTree {
  title?: string;
  description?: string | null;
  total_nodes?: number;
  hero_name?: string | null;
}

async function fetchOgTree(slug: string): Promise<OgTree | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/trees/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: OgTree | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const tree = await fetchOgTree(params.slug);
  const title = tree?.title ?? "A Vow";
  const byline = tree?.hero_name ? `by ${tree.hero_name}` : "on Duskvow";
  const steps = tree?.total_nodes ?? 0;

  // v1: stylized brand card. No tree geometry — that's a richer v2 pass.
  // Intentionally low-dependency: no custom fonts (edge runtime font loading
  // adds latency per request) — the OG renderer falls back to a system serif
  // which still reads as "dark-fantasy" with the palette + ornament.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, rgba(200,75,17,0.25), transparent 70%), linear-gradient(180deg, ${T.bgAbyss} 0%, ${T.bgShadow} 60%, ${T.bgElevated} 100%)`,
          fontFamily: "serif",
          padding: "80px",
          color: T.textPrimary,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "22px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: T.textMuted,
          }}
        >
          ◆ &nbsp;&nbsp; Duskvow &nbsp;&nbsp; ◆
        </div>

        <div
          style={{
            fontSize: "18px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: T.textSecondary,
            marginBottom: "28px",
          }}
        >
          a vow
        </div>

        <div
          style={{
            fontSize: "78px",
            fontWeight: 700,
            color: T.accentGold,
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "1000px",
            textShadow: "0 0 28px rgba(255,215,0,0.35)",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginTop: "48px",
            fontSize: "26px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: T.textSecondary,
          }}
        >
          <span>{steps} steps</span>
          <span style={{ color: T.accentEmber }}>✦</span>
          <span>{byline}</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "48px",
            fontSize: "20px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: T.accentEmber,
          }}
        >
          start your own vow — duskvow.com
        </div>
      </div>
    ),
    { ...size },
  );
}
