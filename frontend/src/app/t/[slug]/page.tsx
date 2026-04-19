import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicTreeView } from "@/components/tree/PublicTreeView";
import type { TalentTree } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type PublicTree = TalentTree & { hero_name: string | null };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchPublicTree(slug: string): Promise<PublicTree | null> {
  // Server-side fetch — no auth header. The backend endpoint enforces
  // is_public=true + deleted_at IS NULL; anything else is a 404.
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/trees/${slug}`, {
      // Public trees change infrequently but completion counters DO shift
      // as the owner walks the tree. 5-minute revalidate is a reasonable
      // balance between freshness and not hammering the backend when a
      // link goes viral.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: PublicTree | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tree = await fetchPublicTree(slug);
  if (!tree) {
    return {
      title: "Vow not found — Duskvow",
      robots: { index: false, follow: false },
    };
  }
  const byline = tree.hero_name ? ` — by ${tree.hero_name}` : "";
  const desc = tree.description?.trim()
    || `A ${tree.total_nodes}-step path on Duskvow. Start your own vow.`;
  return {
    title: `${tree.title}${byline} — Duskvow`,
    description: desc,
    // Noindex by default — viral traction shouldn't mean Google indexing
    // personal vows. Owner can opt in later per-tree once we add that UI.
    robots: { index: false, follow: false },
    openGraph: {
      title: `${tree.title}${byline}`,
      description: desc,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tree.title}${byline}`,
      description: desc,
    },
  };
}

export default async function PublicTreePage({ params }: PageProps) {
  const { slug } = await params;
  const tree = await fetchPublicTree(slug);
  if (!tree) notFound();
  return <PublicTreeView tree={tree} />;
}
