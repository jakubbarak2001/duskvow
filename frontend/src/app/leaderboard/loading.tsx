export default function LeaderboardLoading() {
  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      {/* Navbar skeleton */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)" }}>
        <div className="skeleton" style={{ width: "7rem", height: "1.2rem" }} />
      </div>
      {/* Title + rows */}
      <div style={{ maxWidth: "672px", margin: "0 auto", padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div className="skeleton" style={{ width: "14rem", height: "1.6rem", margin: "0 auto 0.5rem" }} />
          <div className="skeleton" style={{ width: "18rem", height: "0.7rem", margin: "0 auto" }} />
        </div>
        {/* Tab skeletons */}
        <div className="skeleton" style={{ height: "2.5rem", borderRadius: "8px" }} />
        <div className="skeleton" style={{ height: "2.5rem", borderRadius: "8px" }} />
        {/* List rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "8px", opacity: 1 - i * 0.06 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
