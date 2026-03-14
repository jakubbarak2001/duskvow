import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

// Static demo nodes for the hero preview
const DEMO_NODES = [
  { x: 48, y: 8, label: "Install Python", state: "completed", type: "action" },
  { x: 8, y: 36, label: "Variables & Types", state: "completed", type: "action" },
  { x: 88, y: 36, label: "Control Flow", state: "completed", type: "action" },
  { x: 8, y: 64, label: "Functions", state: "available", type: "habit" },
  { x: 88, y: 64, label: "Data Structures", state: "available", type: "action" },
  { x: 48, y: 84, label: "Python Mastery", state: "locked", type: "keystone" },
];

function DemoNode({
  x,
  y,
  label,
  state,
  type,
}: {
  x: number;
  y: number;
  label: string;
  state: string;
  type: string;
}) {
  const isCompleted = state === "completed";
  const isAvailable = state === "available";
  const isKeystone = type === "keystone";

  return (
    <div
      className={isAvailable ? "node-available" : ""}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: isKeystone ? 80 : 60,
        height: isKeystone ? 80 : 60,
        borderRadius: type === "habit" ? "50%" : type === "keystone" ? 0 : "6px",
        clipPath:
          type === "keystone"
            ? "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)"
            : undefined,
        backgroundColor: isCompleted
          ? "rgba(255,215,0,0.1)"
          : "var(--bg-elevated)",
        border: `2px solid ${isCompleted ? "var(--accent-gold)" : isAvailable ? "var(--state-available)" : "rgba(128,128,128,0.25)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: state === "locked" ? 0.45 : 1,
        boxShadow: isCompleted
          ? "0 0 10px rgba(255,215,0,0.3)"
          : isAvailable
            ? "0 0 8px rgba(75,178,249,0.3)"
            : "none",
      }}
    >
      <span
        style={{
          fontSize: "8px",
          textAlign: "center",
          padding: "4px",
          fontWeight: 600,
          color: isCompleted
            ? "var(--accent-gold)"
            : isAvailable
              ? "var(--text-primary)"
              : "var(--text-muted)",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-abyss)", color: "var(--text-primary)" }}
    >
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-16">
        {/* Copy */}
        <div className="flex-1 text-center lg:text-left">
          <p
            className="text-sm font-medium uppercase tracking-widest mb-4"
            style={{ color: "var(--accent-ember)" }}
          >
            AI-Powered Self-Improvement
          </p>
          <h1
            className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--accent-gold)",
            }}
          >
            Turn Your Goals Into&nbsp;
            <span style={{ color: "var(--text-primary)" }}>Epic Quests</span>
          </h1>
          <p
            className="text-lg mb-8 max-w-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Duskvow transforms your real-world goals into interactive RPG talent
            trees. Unlock nodes, earn XP, and forge the path to mastery.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/auth"
              className="px-7 py-3 rounded font-medium text-sm"
              style={{
                backgroundColor: "var(--accent-ember)",
                color: "var(--text-primary)",
              }}
            >
              Make Your Vow — It&apos;s Free
            </Link>
            <Link
              href="/auth"
              className="px-7 py-3 rounded font-medium text-sm"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Demo tree preview */}
        <div className="flex-1 flex justify-center">
          <div
            className="relative"
            style={{ width: 280, height: 300 }}
          >
            {/* SVG edges */}
            <svg
              className="absolute inset-0"
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
            >
              {/* Root → left & right */}
              <line
                x1="50%" y1="14%" x2="14%" y2="40%"
                stroke="rgba(224,216,200,0.1)" strokeWidth="1.5"
              />
              <line
                x1="50%" y1="14%" x2="86%" y2="40%"
                stroke="rgba(224,216,200,0.1)" strokeWidth="1.5"
              />
              {/* Left → capstone */}
              <line
                x1="14%" y1="68%" x2="50%" y2="86%"
                stroke="rgba(75,178,249,0.25)" strokeWidth="1.5"
              />
              {/* Right → capstone */}
              <line
                x1="86%" y1="68%" x2="50%" y2="86%"
                stroke="rgba(75,178,249,0.25)" strokeWidth="1.5"
              />
            </svg>

            {DEMO_NODES.map((n) => (
              <DemoNode key={n.label} {...n} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section
        style={{ borderTop: "1px solid var(--border-default)" }}
        className="py-16"
      >
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "✦",
              title: "AI-Generated Trees",
              body: "Describe your goal and the AI crafts a personalized 20-30 node talent tree in seconds.",
            },
            {
              icon: "⚔",
              title: "RPG Progression",
              body: "Earn XP, maintain streaks, and unlock higher-tier nodes as you advance toward mastery.",
            },
            {
              icon: "◈",
              title: "Dark Fantasy Aesthetic",
              body: "Beautiful rune-carved UI that makes self-improvement feel like an epic quest.",
            },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="p-6 rounded-lg"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                className="text-2xl mb-4"
                style={{ color: "var(--accent-gold)" }}
              >
                {icon}
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
              >
                {title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-20 text-center">
        <h2
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}
        >
          Ready to Begin Your Journey?
        </h2>
        <p className="mb-8" style={{ color: "var(--text-muted)" }}>
          No credit card required. Free forever for one active talent tree.
        </p>
        <Link
          href="/auth"
          className="px-8 py-3 rounded font-medium"
          style={{
            backgroundColor: "var(--accent-ember)",
            color: "var(--text-primary)",
          }}
        >
          Enter the Realm
        </Link>
      </section>
    </main>
  );
}
