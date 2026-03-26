import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{landingStyles}</style>
      <div className="lp-root">
        {/* Noise overlay */}
        <div className="lp-noise" aria-hidden="true" />

        {/* Floating ember particles */}
        <div className="lp-embers" aria-hidden="true">
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
        </div>

        {/* Navigation */}
        <nav className="lp-nav">
          <Link href="/" className="lp-nav-logo">
            Dusk<span>vow</span>
          </Link>
          <a href="#vow" className="lp-nav-cta">Make Your Vow</a>
        </nav>

        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-overlay" aria-hidden="true" />
          <div className="lp-hero-text-shadow" aria-hidden="true" />
          <div className="lp-hero-glow" aria-hidden="true" />
          <div className="lp-hero-content">
            <p className="lp-hero-dagger">Self-Improvement, Reforged</p>
            <h1>
              Your Goals Deserve<br />
              Better Than <em>Pixel Art</em>
            </h1>
            <p className="lp-hero-sub">
              Duskvow turns your ambitions into dark fantasy talent trees —{" "}
              AI-generated, interconnected skill paths you complete node by node.{" "}
              No cute mascots. No hand-holding. Just you and the climb.
            </p>
            <div className="lp-hero-cta-group">
              <Link href="/auth" className="lp-btn-primary">
                <span>Make Your Vow — Free</span>
              </Link>
              <p className="lp-hero-note">No credit card. No pixel penguins. Just purpose.</p>
            </div>
          </div>
          <div className="lp-scroll-hint" aria-hidden="true">
            <span />
          </div>
        </section>

        {/* Anti-Section */}
        <section className="lp-anti">
          <div className="lp-gold-line" aria-hidden="true" />
          <p className="lp-section-mark">◆ &nbsp; A Different Oath &nbsp; ◆</p>
          <h2>
            <span className="lp-strike">Cute companions.</span><br />
            <span className="lp-strike">8-bit sprites.</span><br />
            <span className="lp-strike">Gentle reminders.</span><br /><br />
            We built for the rest of you.
          </h2>
          <p className="lp-anti-text">
            You didn&apos;t beat Malenia by getting a pat on the back. You didn&apos;t{" "}
            clear the Spire by hoping for the best. Your real-life goals deserve{" "}
            the same respect —{" "}
            <strong>a system built for people who don&apos;t need to be coddled.</strong>
          </p>
        </section>

        {/* How It Works */}
        <section className="lp-how">
          <p className="lp-section-mark lp-centered">◆ &nbsp; The Rite &nbsp; ◆</p>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">I</div>
              <div>
                <h3>Speak Your Goal</h3>
                <p>
                  Enter any ambition — from &quot;run a marathon&quot; to &quot;learn
                  Rust&quot; to &quot;build a business.&quot; The AI listens.
                </p>
                <div className="lp-step-example">
                  &quot;I want to become a full-stack developer in 6 months.&quot;
                </div>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">II</div>
              <div>
                <h3>Receive Your Tree</h3>
                <p>
                  The AI forges a talent tree: interconnected nodes with prerequisites,
                  XP values, and a path from novice to mastery. Every tree is unique to
                  your goal.
                </p>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">III</div>
              <div>
                <h3>Walk the Path</h3>
                <p>
                  Complete nodes. Earn XP. Unlock branches. Watch the tree illuminate as
                  you progress — proof, rendered in dark fire, that you are becoming who
                  you set out to be.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshot Placeholder */}
        <section className="lp-showcase">
          <div className="lp-showcase-frame">
            <div className="lp-showcase-overlay" aria-hidden="true" />
            <p className="lp-showcase-placeholder">
              [ Your most stunning talent tree screenshot goes here ]
            </p>
          </div>
          <p className="lp-showcase-caption">
            A real talent tree, generated for &quot;Run a Marathon in 6 Months&quot;
          </p>
        </section>

        {/* Ornament divider */}
        <div className="lp-ornament" aria-hidden="true">· · ·</div>

        {/* Final CTA */}
        <section className="lp-vow" id="vow">
          <div className="lp-vow-glow" aria-hidden="true" />
          <h2>Every Journey Begins<br />With a Vow</h2>
          <p className="lp-vow-sub">Free. No trials. No tricks. One goal, one tree, one path forward.</p>
          <Link href="/auth" className="lp-btn-primary lp-vow-btn">
            <span>Make Your Vow — Free</span>
          </Link>
          <p className="lp-vow-terms">
            Free forever for up to 5 active trees. Built by a solo developer who quit
            his day job to build this.
          </p>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <p className="lp-footer-brand">
            <Link href="/">Duskvow</Link>
            {" "}&nbsp;·&nbsp;{" "}
            <a href="https://x.com/duskvow" target="_blank" rel="noopener noreferrer">X</a>
            {" "}&nbsp;·&nbsp;{" "}
            <a href="#">Discord</a>
          </p>
          <p className="lp-footer-tagline">Forged in solitude. Tempered by ambition.</p>
        </footer>
      </div>
    </>
  );
}

/* ============================================================
   LANDING PAGE STYLES
   All classes prefixed lp- to avoid collision with app styles.
   Color variables scoped to .lp-root.
   ============================================================ */
const landingStyles = `
  .lp-root {
    --void:         #0a0a0c;
    --deep:         #0f0f14;
    --ash:          #1a1a22;
    --smoke:        #2a2a35;
    --ember:        #c4553a;
    --ember-bright: #e8653f;
    --gold-dim:     #8a7340;
    --gold:         #c9a84c;
    --bone:         #d4c9b0;
    --pale:         #9a9484;
    --ghost:        #6a655c;
    --lp-text:      #c8c0b0;
    --text-dim:     #78736a;

    background: var(--void);
    color: var(--lp-text);
    font-family: var(--font-crimson), Georgia, serif;
    font-size: 18px;
    line-height: 1.7;
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
  }

  /* === NOISE OVERLAY === */
  .lp-noise {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.5;
  }

  /* === FLOATING EMBER PARTICLES === */
  .lp-embers {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .lp-ember {
    position: absolute;
    width: 2px;
    height: 2px;
    background: var(--ember);
    border-radius: 50%;
    opacity: 0;
    animation: lp-float-up linear infinite;
  }

  .lp-ember:nth-child(1) { left: 15%; animation-duration:  8s; animation-delay:  0s;   }
  .lp-ember:nth-child(2) { left: 35%; animation-duration: 12s; animation-delay:  2s;   }
  .lp-ember:nth-child(3) { left: 55%; animation-duration: 10s; animation-delay:  4s;   }
  .lp-ember:nth-child(4) { left: 75%; animation-duration:  9s; animation-delay:  1s;   }
  .lp-ember:nth-child(5) { left: 90%; animation-duration: 11s; animation-delay:  3s;   }
  .lp-ember:nth-child(6) { left: 25%; animation-duration: 14s; animation-delay:  5s;   }
  .lp-ember:nth-child(7) { left: 65%; animation-duration:  7s; animation-delay:  6s;   }
  .lp-ember:nth-child(8) { left: 45%; animation-duration: 13s; animation-delay:  1.5s; }

  /* === NAVIGATION === */
  .lp-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, rgba(10,10,12,0.95), transparent);
    backdrop-filter: blur(4px);
  }

  .lp-nav-logo {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 700;
    font-size: 1.3rem;
    letter-spacing: 0.15em;
    color: var(--bone);
    text-decoration: none;
    text-transform: uppercase;
  }

  .lp-nav-logo span {
    color: var(--ember);
  }

  .lp-nav-cta {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--bone);
    border: 1px solid var(--gold-dim);
    padding: 0.6rem 1.8rem;
    text-decoration: none;
    transition: all 0.4s ease;
    background: transparent;
  }

  .lp-nav-cta:hover {
    background: var(--ember);
    border-color: var(--ember);
    color: #fff;
    box-shadow: 0 0 30px rgba(196, 85, 58, 0.3);
  }

  /* === HERO === */
  .lp-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    padding: 8rem 2rem 4rem;
    overflow: hidden;
    background-image: url('/hero_bg.webp');
    background-size: cover;
    background-position: 30% top;
    background-repeat: no-repeat;
  }

  .lp-hero-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(10,10,12,0.7)  0%,
      rgba(10,10,12,0.5) 40%,
      rgba(10,10,12,0.85) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  .lp-hero-text-shadow {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center 60%, rgba(10,10,12,0.6) 0%, transparent 70%);
    z-index: 2;
    pointer-events: none;
  }

  .lp-hero-glow {
    position: absolute;
    bottom: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    height: 60%;
    background: radial-gradient(ellipse at center, rgba(196, 85, 58, 0.06) 0%, transparent 70%);
    z-index: 0;
    pointer-events: none;
  }

  .lp-hero-content {
    position: relative;
    z-index: 3;
    max-width: 800px;
  }

  .lp-hero-dagger {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.8rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--ember);
    margin-bottom: 2rem;
    opacity: 0;
    animation: lp-fadeUp 1s ease 0.3s forwards;
  }

  .lp-hero-dagger::before,
  .lp-hero-dagger::after {
    content: '——';
    margin: 0 1rem;
    color: var(--smoke);
  }

  .lp-hero-content h1 {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 900;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    line-height: 1.15;
    color: var(--bone);
    margin-bottom: 1.5rem;
    opacity: 0;
    animation: lp-fadeUp 1s ease 0.5s forwards;
  }

  .lp-hero-content h1 em {
    font-style: normal;
    color: var(--ember-bright);
    position: relative;
  }

  .lp-hero-content h1 em::after {
    content: '';
    position: absolute;
    bottom: 0.05em;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--ember), transparent);
  }

  .lp-hero-sub {
    font-size: 1.25rem;
    font-weight: 300;
    color: var(--pale);
    max-width: 560px;
    margin: 0 auto 3rem;
    line-height: 1.8;
    opacity: 0;
    animation: lp-fadeUp 1s ease 0.7s forwards;
  }

  .lp-hero-cta-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    opacity: 0;
    animation: lp-fadeUp 1s ease 0.9s forwards;
  }

  /* === PRIMARY BUTTON === */
  .lp-btn-primary {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #fff;
    background: linear-gradient(135deg, var(--ember), #a03a28);
    border: none;
    padding: 1.1rem 3.5rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
    display: inline-block;
  }

  .lp-btn-primary::before {
    content: '';
    position: absolute;
    top: 0; left: -100%; right: 0; bottom: 0;
    width: 100%;
    background: linear-gradient(135deg, var(--ember-bright), var(--ember));
    transition: left 0.4s ease;
    z-index: 0;
  }

  .lp-btn-primary:hover::before {
    left: 0;
  }

  .lp-btn-primary:hover {
    box-shadow: 0 4px 40px rgba(196, 85, 58, 0.4), 0 0 80px rgba(196, 85, 58, 0.1);
    transform: translateY(-1px);
  }

  .lp-btn-primary span {
    position: relative;
    z-index: 1;
  }

  .lp-hero-note {
    font-size: 0.85rem;
    color: var(--text-dim);
    font-style: italic;
  }

  .lp-scroll-hint {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    opacity: 0;
    animation: lp-fadeUp 1s ease 1.2s forwards;
  }

  .lp-scroll-hint span {
    display: block;
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, var(--gold-dim), transparent);
    margin: 0 auto;
    animation: lp-scrollPulse 2s ease-in-out infinite;
  }

  /* === ANTI-SECTION === */
  .lp-anti {
    padding: 8rem 2rem;
    text-align: center;
    position: relative;
  }

  .lp-gold-line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
  }

  .lp-section-mark {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold-dim);
    margin-bottom: 3rem;
  }

  .lp-centered { text-align: center; }

  .lp-anti h2 {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 700;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: var(--bone);
    line-height: 1.3;
    max-width: 700px;
    margin: 0 auto 2rem;
  }

  .lp-strike {
    text-decoration: line-through;
    color: var(--ghost);
    font-weight: 400;
  }

  .lp-anti-text {
    font-size: 1.15rem;
    font-weight: 300;
    color: var(--pale);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.9;
  }

  .lp-anti-text strong {
    color: var(--ember-bright);
    font-weight: 500;
  }

  /* === HOW IT WORKS === */
  .lp-how {
    padding: 6rem 2rem 8rem;
    position: relative;
  }

  .lp-steps {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .lp-step {
    display: grid;
    grid-template-columns: 80px 1fr;
    gap: 2rem;
    padding: 3rem 0;
    border-bottom: 1px solid rgba(138, 115, 64, 0.08);
  }

  .lp-step:last-child {
    border-bottom: none;
  }

  .lp-step-num {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 3rem;
    font-weight: 900;
    color: var(--ash);
    line-height: 1;
    padding-top: 0.2rem;
  }

  .lp-step h3 {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 600;
    font-size: 1.3rem;
    color: var(--bone);
    margin-bottom: 0.8rem;
    letter-spacing: 0.02em;
  }

  .lp-step p {
    font-weight: 300;
    color: var(--pale);
    line-height: 1.8;
    max-width: 500px;
  }

  .lp-step-example {
    margin-top: 1rem;
    padding: 1rem 1.5rem;
    background: var(--deep);
    border-left: 2px solid var(--ember);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--gold);
  }

  /* === SCREENSHOT PLACEHOLDER === */
  .lp-showcase {
    padding: 2rem 2rem 8rem;
    text-align: center;
  }

  .lp-showcase-frame {
    max-width: 1000px;
    margin: 0 auto;
    aspect-ratio: 16 / 9;
    background: var(--deep);
    border: 1px solid var(--smoke);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .lp-showcase-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(circle at 30% 40%, rgba(196, 85, 58, 0.05), transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(138, 115, 64, 0.05), transparent 50%);
  }

  .lp-showcase-placeholder {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.8rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ghost);
    position: relative;
    z-index: 1;
  }

  .lp-showcase-caption {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    font-style: italic;
    color: var(--text-dim);
  }

  /* === ORNAMENT === */
  .lp-ornament {
    text-align: center;
    padding: 2rem 0;
    color: var(--smoke);
    font-size: 1.5rem;
    letter-spacing: 0.5em;
  }

  /* === FINAL CTA (VOW) === */
  .lp-vow {
    padding: 8rem 2rem;
    text-align: center;
    position: relative;
    background: linear-gradient(to bottom, var(--void), var(--deep), var(--void));
  }

  .lp-vow-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(196, 85, 58, 0.06), transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .lp-vow h2 {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 900;
    font-size: clamp(2rem, 4vw, 3rem);
    color: var(--bone);
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .lp-vow-sub {
    font-size: 1.1rem;
    font-weight: 300;
    color: var(--pale);
    margin-bottom: 3rem;
    position: relative;
    z-index: 1;
  }

  .lp-vow-btn {
    position: relative;
    z-index: 1;
  }

  .lp-vow-terms {
    margin-top: 1.5rem;
    font-size: 0.8rem;
    color: var(--text-dim);
    font-style: italic;
    position: relative;
    z-index: 1;
  }

  /* === FOOTER === */
  .lp-footer {
    padding: 3rem 2rem;
    text-align: center;
    border-top: 1px solid rgba(138, 115, 64, 0.08);
  }

  .lp-footer-brand {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ghost);
  }

  .lp-footer-brand a {
    color: var(--ghost);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .lp-footer-brand a:hover {
    color: var(--bone);
  }

  .lp-footer-tagline {
    font-size: 0.85rem;
    font-style: italic;
    color: var(--text-dim);
    margin-top: 0.5rem;
  }

  /* === KEYFRAMES === */
  @keyframes lp-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes lp-scrollPulse {
    0%, 100% { opacity: 0.3; transform: scaleY(1); }
    50%       { opacity: 0.8; transform: scaleY(1.2); }
  }

  @keyframes lp-float-up {
    0%   { bottom: -5%;  opacity: 0;   transform: translateX(0);   }
    10%  {               opacity: 0.6;                              }
    90%  {               opacity: 0.2;                              }
    100% { bottom: 105%; opacity: 0;   transform: translateX(30px); }
  }

  /* === RESPONSIVE === */
  @media (max-width: 768px) {
    .lp-nav { padding: 1rem 1.5rem; }
    .lp-hero { padding: 6rem 1.5rem 4rem; }
    .lp-step { grid-template-columns: 50px 1fr; gap: 1rem; }
    .lp-step-num { font-size: 2rem; }
    .lp-anti,
    .lp-how,
    .lp-showcase,
    .lp-vow { padding-left: 1.5rem; padding-right: 1.5rem; }
  }
`;
