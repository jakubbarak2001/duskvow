"use client";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "4px",
  className = "",
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

/** Skeleton shaped like the StatsBar component */
export function StatsBarSkeleton() {
  return (
    <div
      className="w-full rounded-lg"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-stretch" style={{ minHeight: "120px" }}>
        {/* Level section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-2">
          <Skeleton width="3rem" height="3rem" borderRadius="50%" />
          <Skeleton width="5rem" height="0.6rem" />
          <Skeleton width="6rem" height="4px" borderRadius="2px" />
        </div>
        <div className="w-px my-4" style={{ backgroundColor: "var(--border-default)" }} />
        {/* Streak section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-2">
          <Skeleton width="3rem" height="3rem" borderRadius="50%" />
          <Skeleton width="4rem" height="0.6rem" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton shaped like a tree/vow card */
export function TreeCardSkeleton() {
  return (
    <div
      className="p-5 rounded-lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderLeft: "3px solid var(--bg-highlight)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <Skeleton width="60%" height="1.1rem" style={{ marginBottom: "0.5rem" }} />
          <Skeleton width="80%" height="0.75rem" style={{ marginBottom: "0.4rem" }} />
          <Skeleton width="40%" height="0.65rem" />
        </div>
        <Skeleton width="4rem" height="1.5rem" borderRadius="4px" />
      </div>
      <Skeleton width="100%" height="0.5rem" borderRadius="9999px" style={{ marginTop: "1rem" }} />
    </div>
  );
}

/** Skeleton for a dungeon tier card */
export function TierCardSkeleton() {
  return (
    <div
      className="rounded-lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        padding: "1.5rem",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <Skeleton width="3rem" height="3rem" borderRadius="50%" />
      <Skeleton width="70%" height="1rem" />
      <Skeleton width="50%" height="0.7rem" />
      <Skeleton width="100%" height="2.5rem" borderRadius="4px" style={{ marginTop: "auto" }} />
    </div>
  );
}

/** Skeleton for the dashboard door cards */
export function DoorCardSkeleton() {
  return (
    <div
      className="hub-door"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div style={{ height: "320px", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "2rem" }}>
        <Skeleton width="60%" height="60%" borderRadius="8px" />
      </div>
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <Skeleton width="60%" height="1.2rem" />
        <Skeleton width="80%" height="0.7rem" />
        <Skeleton width="40%" height="2rem" borderRadius="4px" style={{ marginTop: "0.5rem" }} />
      </div>
    </div>
  );
}
