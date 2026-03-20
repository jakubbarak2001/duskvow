import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

// ------------------------------------------------------------
// Demo tree data — "Learn Python" showcase
// ------------------------------------------------------------

const W = 380;
const H = 480;

const NODES = [
  { id: 0, cx: 190, cy: 52,  label: "Install Python",    state: "completed", type: "action"   },
  { id: 1, cx: 68,  cy: 172, label: "Variables & Types", state: "completed", type: "action"   },
  { id: 2, cx: 312, cy: 172, label: "Control Flow",      state: "completed", type: "action"   },
  { id: 3, cx: 68,  cy: 300, label: "Functions",         state: "available", type: "habit"    },
  { id: 4, cx: 312, cy: 300, label: "Data Structures",   state: "available", type: "action"   },
  { id: 5, cx: 190, cy: 415, label: "Python Mastery",    state: "locked",    type: "keystone" },
] as const;

const STD = 68; // standard node diameter
const KEY = 82; // keystone node diameter

function sz(type: string) {
  return type === "keystone" ? KEY : STD;
}

// ------------------------------------------------------------
// SVG edges — bezier curves with glow passes
// ------------------------------------------------------------

function DemoEdges() {
  // path d values keyed by "from-to"
  const paths: Record<string, string> = {
    "0-1": "M 190,52 C 190,112 68,112 68,172",
    "0-2": "M 190,52 C 190,112 312,112 312,172",
    "1-3": "M 68,172 C 78,220 58,252 68,300",
    "2-4": "M 312,172 C 302,220 322,252 312,300",
    "3-5": "M 68,300 C 68,366 190,395 190,415",
    "4-5": "M 312,300 C 312,366 190,395 190,415",
  };

  return (
    <svg
      className="absolute inset-0"
      width={W}
      height={H}
      style={{ overflow: "visible", pointerEvents: "none" }}
    >
      <defs>
        {/* Gold → Blue gradient for completed→available edges */}
        <linearGradient
          id="g-fade-left"
          x1="68" y1="172" x2="68" y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#FFD700" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4BB2F9" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient
          id="g-fade-right"
          x1="312" y1="172" x2="312" y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%"   stopColor="#FFD700" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4BB2F9" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* --- Gold completed edges (glow pass then main) --- */}
      {["0-1", "0-2"].map((key) => (
        <g key={key}>
          <path d={paths[key]} fill="none" stroke="rgba(255,215,0,0.18)" strokeWidth="7" />
          <path d={paths[key]} fill="none" stroke="rgba(255,215,0,0.65)" strokeWidth="1.5" />
        </g>
      ))}

      {/* --- Fade edges: gold→blue --- */}
      <g>
        <path d={paths["1-3"]} fill="none" stroke="rgba(255,215,0,0.12)" strokeWidth="7" />
        <path d={paths["1-3"]} fill="none" stroke="url(#g-fade-left)"   strokeWidth="1.5" />
      </g>
      <g>
        <path d={paths["2-4"]} fill="none" stroke="rgba(255,215,0,0.12)" strokeWidth="7" />
        <path d={paths["2-4"]} fill="none" stroke="url(#g-fade-right)"  strokeWidth="1.5" />
      </g>

      {/* --- Dim locked edges --- */}
      {["3-5", "4-5"].map((key) => (
        <path
          key={key}
          d={paths[key]}
          fill="none"
          stroke="rgba(128,128,128,0.18)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
    </svg>
  );
}

// ------------------------------------------------------------
// Individual node
// ------------------------------------------------------------

function DemoNode({
  cx, cy, label, state, type,
}: {
  cx: number; cy: number; label: string; state: string; type: string;
}) {
  const size     = sz(type);
  const half     = size / 2;
  const isComp   = state === "completed";
  const isAvail  = state === "available";
  const isLocked = state === "locked";

  /* Shape */
  const borderRadius =
    type === "habit"    ? "50%"  :
    type === "keystone" ? "0"    : "10px";
  const clipPath =
    type === "keystone"
      ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
      : undefined;

  /* Colors */
  const borderColor = isComp  ? "rgba(255,215,0,0.85)"
                    : isAvail ? "rgba(75,178,249,0.75)"
                    : "rgba(128,128,128,0.25)";

  const bgGradient = isComp
    ? "radial-gradient(circle at 38% 36%, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.07) 55%, rgba(255,215,0,0.03) 100%)"
    : isAvail
    ? "radial-gradient(circle at 38% 36%, rgba(75,178,249,0.14) 0%, rgba(75,178,249,0.05) 55%, rgba(75,178,249,0.02) 100%)"
    : "radial-gradient(circle at 50% 50%, rgba(28,28,38,0.95) 0%, rgba(10,10,18,0.98) 100%)";

  const boxGlow = isComp
    ? "0 0 22px rgba(255,215,0,0.55), 0 0 44px rgba(255,215,0,0.18), inset 0 0 14px rgba(255,215,0,0.07)"
    : isAvail
    ? "0 0 16px rgba(75,178,249,0.5), 0 0 32px rgba(75,178,249,0.16)"
    : "none";

  /* Inner symbol */
  const symbol =
    isComp             ? "✦"  :
    type === "habit"   ? "◎"  :
    type === "keystone"? "⬡"  : "◈";

  const symbolColor = isComp  ? "rgba(255,215,0,0.95)"
                    : isAvail ? "rgba(75,178,249,0.9)"
                    : "rgba(128,128,128,0.35)";
  const symbolSize = type === "keystone" ? "22px" : "20px";

  /* Label */
  const labelColor = isComp  ? "rgba(255,215,0,0.88)"
                   : isAvail ? "rgba(75,178,249,0.82)"
                   : "rgba(128,128,128,0.38)";
  const labelGlow  = isComp  ? "0 0 8px rgba(255,215,0,0.55)"
                   : isAvail ? "0 0 8px rgba(75,178,249,0.45)"
                   : "none";

  return (
    <>
      {/* Node body */}
      <div
        className={isAvail ? "node-available" : ""}
        style={{
          position:        "absolute",
          left:            cx - half,
          top:             cy - half,
          width:           size,
          height:          size,
          borderRadius,
          clipPath,
          background:      bgGradient,
          border:          `1.5px solid ${borderColor}`,
          boxShadow:       boxGlow,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          opacity:         isLocked ? 0.38 : 1,
          zIndex:          2,
          transition:      "box-shadow 0.3s ease",
        }}
      >
        <span style={{ fontSize: symbolSize, color: symbolColor, userSelect: "none", lineHeight: 1 }}>
          {symbol}
        </span>
      </div>

      {/* Label positioned below the node */}
      <div
        style={{
          position:   "absolute",
          left:       cx,
          top:        cy + half + 14,
          transform:  "translateX(-50%)",
          fontSize:   "9px",
          fontWeight: 700,
          color:      labelColor,
          textAlign:  "center",
          whiteSpace: "nowrap",
          letterSpacing: "0.05em",
          textShadow: labelGlow,
          userSelect: "none",
          zIndex:     2,
          opacity:    isLocked ? 0.38 : 1,
        }}
      >
        {label.toUpperCase()}
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Full hero tree widget
// ------------------------------------------------------------

function HeroTree() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div
        className="tree-reveal"
        style={{
          position: "relative",
          width:  W,
          height: H,
          flexShrink: 0,
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: "radial-gradient(ellipse 55% 55% at 50% 48%, rgba(255,215,0,0.04) 0%, rgba(75,178,249,0.03) 45%, transparent 75%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Edges */}
        <DemoEdges />

        {/* Nodes */}
        {NODES.map((n) => (
          <DemoNode key={n.id} {...n} />
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Page
// ------------------------------------------------------------

export default function LandingPage() {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-abyss)", color: "var(--text-primary)" }}
    >
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-12">
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
            style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}
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
              style={{ backgroundColor: "var(--accent-ember)", color: "var(--text-primary)" }}
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

        {/* Tree visualization */}
        <HeroTree />
      </section>

      {/* Feature row */}
      <section style={{ borderTop: "1px solid var(--border-default)" }} className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "✦",
              title: "AI-Generated Trees",
              body: "Describe your goal and the AI crafts a personalized 20–30 node talent tree in seconds.",
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
              <div className="text-2xl mb-4" style={{ color: "var(--accent-gold)" }}>
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
          style={{ backgroundColor: "var(--accent-ember)", color: "var(--text-primary)" }}
        >
          Enter the Realm
        </Link>
      </section>
    </main>
  );
}
