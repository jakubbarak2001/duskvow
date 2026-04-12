export default function DashboardLoading() {
  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      {/* Navbar skeleton */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)" }}>
        <div className="skeleton" style={{ width: "7rem", height: "1.2rem" }} />
      </div>
      {/* Door cards */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
        <div className="skeleton" style={{ width: "10rem", height: "1.4rem", borderRadius: "4px" }} />
        <div className="skeleton" style={{ width: "16rem", height: "0.75rem", borderRadius: "4px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", width: "100%", marginTop: "1rem" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: "220px", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
