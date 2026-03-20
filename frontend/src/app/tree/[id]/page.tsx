import { TreeViewPage } from "@/components/tree/TreeViewPage";

// Required for static export — tree IDs are user-generated UUIDs that
// can't be pre-generated. The _redirects file handles SPA routing so
// direct URL access still works via client-side navigation.
export function generateStaticParams() {
  return [];
}

export default function Page() {
  return <TreeViewPage />;
}
