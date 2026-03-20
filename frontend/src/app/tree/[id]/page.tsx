import dynamic from "next/dynamic";

// Load the tree view client-side only — React Flow uses browser globals
// that crash Node.js during static export's server evaluation pass.
const TreeViewPage = dynamic(
  () => import("@/components/tree/TreeViewPage").then((m) => ({ default: m.TreeViewPage })),
  { ssr: false },
);

export function generateStaticParams() {
  return [];
}

export default function Page() {
  return <TreeViewPage />;
}
