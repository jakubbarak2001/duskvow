"use client";

import dynamic from "next/dynamic";

// ssr: false must live in a Client Component — this wrapper exists solely
// to satisfy that constraint while keeping generateStaticParams in the
// Server Component page above.
const TreeViewPage = dynamic(
  () =>
    import("@/components/tree/TreeViewPage").then((m) => ({
      default: m.TreeViewPage,
    })),
  { ssr: false },
);

export function TreeViewPageWrapper() {
  return <TreeViewPage />;
}
