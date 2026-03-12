export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-abyss)", color: "var(--text-primary)" }}>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}>
          Duskvow
        </h1>
        <p className="text-xl mb-8" style={{ color: "var(--text-secondary)" }}>
          Forge your path. Unlock your potential.
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Landing page — placeholder (Task 8)
        </p>
      </div>
    </main>
  );
}
