"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TalentTree } from "@/types";

interface ShareTreeModalProps {
  tree: TalentTree;
  token: string;
  onClose: () => void;
  /** Fired when the tree's publish state changes so the parent can refresh. */
  onPublishChange?: (isPublic: boolean, slug: string | null) => void;
}

function publicUrl(slug: string): string {
  if (typeof window === "undefined") return `/t/${slug}`;
  return `${window.location.origin}/t/${slug}`;
}

/**
 * ShareTreeModal — lets the owner publish a tree to a public /t/{slug} URL,
 * copy the link, or un-publish. The first publish shows an explicit consent
 * block so the user sees exactly what goes public (title, description, every
 * step name).
 */
export function ShareTreeModal({ tree, token, onClose, onPublishChange }: ShareTreeModalProps) {
  const [isPublic, setIsPublic] = useState<boolean>(Boolean(tree.is_public));
  const [slug, setSlug] = useState<string | null>(tree.share_slug ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePublish = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await api.shareTree(tree.id, token);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (res.data) {
      setIsPublic(true);
      setSlug(res.data.slug);
      onPublishChange?.(true, res.data.slug);
    }
  };

  const handleUnpublish = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await api.unshareTree(tree.id, token);
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setIsPublic(false);
    onPublishChange?.(false, slug);
  };

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(publicUrl(slug));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — select the input so the user can copy manually.
      setError("Clipboard blocked — copy the link manually.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="share-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="share-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-modal-header">
          <span className="share-modal-eyebrow">◆ &nbsp; Share Your Vow &nbsp; ◆</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="share-modal-close"
          >
            ×
          </button>
        </div>

        <h2 className="share-modal-title">{tree.title}</h2>

        {!isPublic ? (
          <>
            <p className="share-modal-consent">
              Publishing makes this vow visible to anyone with the link.
              The title, description, and every step name will be public.
              Don&apos;t publish a vow that contains anything you wouldn&apos;t
              paste into a group chat.
            </p>
            <p className="share-modal-subnote">
              No XP, no personal stats, no identity beyond your hero name
              will be shown.
            </p>
            <div className="share-modal-actions">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="share-modal-btn share-modal-btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={busy}
                className="share-modal-btn share-modal-btn-ember"
              >
                {busy ? "Publishing…" : "Publish & Copy Link"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="share-modal-consent">
              Your vow is public. Anyone with the link can see it. They
              can&apos;t edit it and they can&apos;t see who you are beyond
              your hero name.
            </p>
            <div className="share-modal-link-row">
              <input
                type="text"
                readOnly
                value={slug ? publicUrl(slug) : ""}
                onFocus={(e) => e.currentTarget.select()}
                className="share-modal-link-input"
                aria-label="Public share link"
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!slug}
                className="share-modal-btn share-modal-btn-ember"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="share-modal-actions">
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={busy}
                className="share-modal-btn share-modal-btn-ghost-danger"
              >
                {busy ? "Unpublishing…" : "Make Private"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="share-modal-btn share-modal-btn-ghost"
              >
                Done
              </button>
            </div>
          </>
        )}

        {error && <p role="alert" className="share-modal-error">{error}</p>}
      </div>
    </div>
  );
}
