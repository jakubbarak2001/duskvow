"use client";

import Link from "next/link";
import type { TalentTree, SkillNode } from "@/types";

interface ResumeStripProps {
  primaryTree: TalentTree | null;
  loading: boolean;
}

/**
 * Dashboard primary-action card. Shows the user where they left off and
 * gives them one prominent CTA to continue. Three visual states:
 *  - Loading   → shimmer skeleton so mount doesn't jank the doors below.
 *  - Empty     → atmospheric "begin your first vow" card for new accounts.
 *  - Active    → tree title + next node + Continue CTA.
 *
 * Note: `primaryTree` must be the full tree detail (with `nodes` populated).
 * The dashboard resolves this via a follow-up `api.getTree` call, because
 * the `listTrees` endpoint returns trees without their nodes.
 */
export function ResumeStrip({ primaryTree, loading }: ResumeStripProps) {
  if (loading) return <ResumeStripSkeleton />;
  if (!primaryTree) return <ResumeStripEmpty />;

  const nextNode = pickNextNode(primaryTree.nodes);

  return (
    <div className="resume-strip resume-strip-active">
      <div className="resume-strip-main">
        <div className="resume-strip-eyebrow">◆&nbsp;&nbsp;Continue Your Path&nbsp;&nbsp;◆</div>
        <h2 className="resume-strip-title">{primaryTree.title}</h2>
        {nextNode && (
          <p className="resume-strip-next">
            Next <span className="resume-strip-next-sep">◆</span> {nextNode.title}
          </p>
        )}
        <Link href={`/tree/${primaryTree.id}`} className="resume-strip-cta">
          <span>Continue</span>
          <span className="resume-strip-cta-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}

/** Pick the best next node to work on: first available → first in_progress → null. */
function pickNextNode(nodes: SkillNode[] | undefined | null): SkillNode | null {
  if (!nodes || nodes.length === 0) return null;
  const byOrder = [...nodes].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  return (
    byOrder.find((n) => n.state === "available") ??
    byOrder.find((n) => n.state === "in_progress") ??
    null
  );
}

function ResumeStripEmpty() {
  return (
    <div className="resume-strip resume-strip-empty">
      <div className="resume-strip-eyebrow">◆&nbsp;&nbsp;Begin Your First Vow&nbsp;&nbsp;◆</div>
      <p className="resume-strip-empty-copy">
        Speak your ambition and watch it take form.
      </p>
      <Link href="/tree/new" className="resume-strip-cta">
        <span>Speak a Vow</span>
        <span className="resume-strip-cta-arrow">→</span>
      </Link>
    </div>
  );
}

function ResumeStripSkeleton() {
  return (
    <div className="resume-strip-loading" role="status" aria-live="polite">
      <p className="resume-strip-loading-line">The embers gather&hellip;</p>
    </div>
  );
}
