import { TreeViewPageWrapper } from "@/components/tree/TreeViewPageWrapper";

export async function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <TreeViewPageWrapper />;
}
