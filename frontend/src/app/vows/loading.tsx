export default function VowsLoading() {
  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      {/* Navbar skeleton */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)" }}>
        <div className="skeleton" style={{ width: "7rem", height: "1.2rem" }} />
      </div>
      {/* StatsBar skeleton */}
      <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)", display: "flex", gap: "1.5rem", justifyContent: "flex-end" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ width: "5rem", height: "2rem", borderRadius: "6px" }} />
        ))}
      </div>
      {/* Tree cards */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div className="skeleton" style={{ width: "10rem", height: "1rem", marginBottom: "1.5rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "8px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
