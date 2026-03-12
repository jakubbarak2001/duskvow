interface TreeViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function TreeViewPage({ params }: TreeViewPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-abyss)", color: "var(--text-primary)" }}>
      <div className="w-full h-screen flex flex-col">
        <div className="px-4 py-3 flex items-center gap-4" style={{ backgroundColor: "var(--bg-shadow)", borderBottom: "1px solid var(--border-default)" }}>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}>
            Talent Tree
          </h1>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            ID: {id}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--text-muted)" }}>
            Tree viewer — placeholder (Task 6)
          </p>
        </div>
      </div>
    </main>
  );
}
