export default function ProfileLoading() {
  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid rgba(224,216,200,0.07)" }}>
        <div className="skeleton" style={{ width: "6rem", height: "0.65rem" }} />
      </div>
      {/* Hero sigil + stats */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem 4rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
        <div className="skeleton" style={{ width: "130px", height: "130px", borderRadius: "50%" }} />
        <div className="skeleton" style={{ width: "8rem", height: "1rem" }} />
        <div className="skeleton" style={{ width: "5rem", height: "0.7rem" }} />
        <div className="skeleton" style={{ width: "min(400px, 90%)", height: "8px", borderRadius: "4px" }} />
        {/* Stat rows */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2px", marginTop: "1rem" }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="skeleton" style={{ height: "2.5rem", borderRadius: "0" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
