export default function DungeonLoading() {
  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      {/* Navbar skeleton */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)" }}>
        <div className="skeleton" style={{ width: "7rem", height: "1.2rem" }} />
      </div>
      {/* Title + tier cards */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        <div className="skeleton" style={{ width: "14rem", height: "1.6rem" }} />
        <div className="skeleton" style={{ width: "12rem", height: "0.75rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem", width: "100%", marginTop: "1rem" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "8px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
