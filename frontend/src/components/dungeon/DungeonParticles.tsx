"use client";

const PARTICLES = [
  { left: "5%",  delay: "0s",   dur: "18s", anim: "dungeon-float-a", size: 3, color: "var(--accent-ember)" },
  { left: "12%", delay: "4s",   dur: "22s", anim: "dungeon-float-b", size: 2, color: "var(--accent-ember)" },
  { left: "20%", delay: "8s",   dur: "20s", anim: "dungeon-float-c", size: 2, color: "var(--accent-blood)" },
  { left: "30%", delay: "2s",   dur: "25s", anim: "dungeon-float-a", size: 3, color: "var(--accent-ember)" },
  { left: "38%", delay: "12s",  dur: "19s", anim: "dungeon-float-b", size: 2, color: "var(--accent-blood)" },
  { left: "48%", delay: "6s",   dur: "23s", anim: "dungeon-float-c", size: 2, color: "var(--accent-ember)" },
  { left: "55%", delay: "1s",   dur: "21s", anim: "dungeon-float-a", size: 3, color: "var(--accent-gold)" },
  { left: "65%", delay: "9s",   dur: "18s", anim: "dungeon-float-b", size: 2, color: "var(--accent-ember)" },
  { left: "72%", delay: "15s",  dur: "24s", anim: "dungeon-float-c", size: 2, color: "var(--accent-blood)" },
  { left: "80%", delay: "3s",   dur: "20s", anim: "dungeon-float-a", size: 3, color: "var(--accent-ember)" },
  { left: "88%", delay: "7s",   dur: "22s", anim: "dungeon-float-b", size: 2, color: "var(--accent-ember)" },
  { left: "95%", delay: "11s",  dur: "19s", anim: "dungeon-float-c", size: 2, color: "var(--accent-blood)" },
];

export function DungeonParticles() {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: p.left,
            bottom: "-2%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: 0,
            animationName: p.anim,
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            pointerEvents: "none",
            zIndex: 1,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </>
  );
}
