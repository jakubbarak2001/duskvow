export default function TreeLoading() {
  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar skeleton */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)" }}>
        <div className="skeleton" style={{ width: "7rem", height: "1.2rem" }} />
      </div>
      {/* Tree header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--bg-shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="skeleton" style={{ width: "5rem", height: "0.75rem" }} />
          <div className="skeleton" style={{ width: "8rem", height: "1rem" }} />
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ width: "4.5rem", height: "1.8rem", borderRadius: "6px" }} />
          ))}
        </div>
      </div>
      {/* Tree node skeletons */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem", opacity: 0.5 }}>
        <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
        <div style={{ display: "flex", gap: "3rem" }}>
          <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
          <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
        </div>
      </div>
    </div>
  );
}
