import Link from "next/link";
import ScrollToTopLogo from "@/components/ScrollToTopLogo";

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
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
          <div className="lp-ember" />
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
          <ScrollToTopLogo />
          <Link href="/auth" className="lp-nav-cta">Make Your Vow</Link>
        </nav>

        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-overlay" aria-hidden="true" />
          <div className="lp-hero-text-shadow" aria-hidden="true" />
          <div className="lp-hero-glow" aria-hidden="true" />
          <div className="lp-hero-content">
            <p className="lp-hero-dagger">For the goal you keep putting off</p>
            <h1>
              Speak the goal.<br />
              Walk the steps.
            </h1>
            <p className="lp-hero-sub">
              You know what you want. Most days, you don&apos;t know where to start.
              Duskvow takes one ambition — learn AI, run a marathon, ship the
              startup — and forges it into a lit path of small, concrete steps.
              You walk it one bite at a time, at your pace.
            </p>
            <div className="lp-hero-cta-group">
              <Link href="/auth" className="lp-btn-primary">
                <span>Make Your Vow — Free</span>
              </Link>
              <p className="lp-hero-note">No credit card. First step in 60 seconds.</p>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="lp-anti">
          <div className="lp-gold-line" aria-hidden="true" />
          <p className="lp-section-mark">◆ &nbsp; The Vow &nbsp; ◆</p>
          <h2>
            The vow is simple.
          </h2>
          <p className="lp-anti-text">
            Games you love respect you by giving you what you need.{" "}
            We tried to build the self-improvement app that <strong>does the same.</strong>
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
                <p>Say what you&apos;re chasing. We read every word before we build.</p>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">II</div>
              <div>
                <h3>Receive Your Tree</h3>
                <p>A branching talent tree, shaped from the words you spoke.</p>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">III</div>
              <div>
                <h3>Walk the Path</h3>
                <p>Tap the first step. Then the next. The path lights behind you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="lp-vow" id="vow">
          <div className="lp-vow-glow" aria-hidden="true" />
          <h2>Every Journey Begins<br />With a Vow</h2>
          <p className="lp-vow-sub">Free. No trials. No tricks. One goal, one tree, one path forward.</p>
          <Link href="/auth" className="lp-btn-primary lp-vow-btn">
            <span>Make Your Vow — Free</span>
          </Link>
          <p className="lp-vow-terms">
            Start in a minute. Stay as long as it serves you.
          </p>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <p className="lp-footer-brand">
            <Link href="https://duskvow.com">Duskvow</Link>
            {" "}&nbsp;·&nbsp;{" "}
            <Link href="/privacy">Privacy</Link>
            {" "}&nbsp;·&nbsp;{" "}
            <Link href="/terms">Terms</Link>
            {" "}&nbsp;·&nbsp;{" "}
            <a href="https://x.com/jacobduskvow" target="_blank" rel="noopener noreferrer">X</a>
          </p>
          <p className="lp-footer-tagline">Tempered by ambition. Tended by hand.</p>
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
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 10;
    overflow: hidden;
  }

  .lp-ember {
    position: absolute;
    border-radius: 50%;
    opacity: 0;
  }

  /* --- Size & color groups --- */
  /* 2px small — ember red, faint glow */
  .lp-ember:nth-child(2),
  .lp-ember:nth-child(4),
  .lp-ember:nth-child(11),
  .lp-ember:nth-child(14),
  .lp-ember:nth-child(18) {
    width: 2px; height: 2px;
    background: var(--ember-bright);
    box-shadow: 0 0 5px 1px rgba(232, 101, 63, 0.5);
  }

  /* 3px medium — ember red */
  .lp-ember:nth-child(1),
  .lp-ember:nth-child(7),
  .lp-ember:nth-child(9),
  .lp-ember:nth-child(13),
  .lp-ember:nth-child(16),
  .lp-ember:nth-child(19) {
    width: 3px; height: 3px;
    background: var(--ember-bright);
    box-shadow: 0 0 6px 2px rgba(232, 101, 63, 0.6);
  }

  /* 4px larger — alternating ember/gold */
  .lp-ember:nth-child(3),
  .lp-ember:nth-child(12),
  .lp-ember:nth-child(17) {
    width: 4px; height: 4px;
    background: var(--ember-bright);
    box-shadow: 0 0 7px 2px rgba(232, 101, 63, 0.65);
  }
  .lp-ember:nth-child(6),
  .lp-ember:nth-child(20) {
    width: 4px; height: 4px;
    background: var(--gold);
    box-shadow: 0 0 7px 2px rgba(201, 168, 76, 0.65);
  }

  /* 6px large — close/bright, mix ember and gold */
  .lp-ember:nth-child(5),
  .lp-ember:nth-child(8),
  .lp-ember:nth-child(10) {
    width: 6px; height: 6px;
    background: var(--ember-bright);
    box-shadow: 0 0 10px 3px rgba(232, 101, 63, 0.75);
  }
  .lp-ember:nth-child(15) {
    width: 6px; height: 6px;
    background: var(--gold);
    box-shadow: 0 0 10px 3px rgba(201, 168, 76, 0.75);
  }

  /* --- Position, speed, delay, sway variant --- */
  /* lp-float-a: sways right-left-right, peaks opacity 0.9 */
  /* lp-float-b: sways left-right, peaks opacity 0.75       */
  /* lp-float-c: gentle sway, peaks opacity 0.6             */

  .lp-ember:nth-child(1)  { left:  8%; animation: lp-float-a  8s linear 0s    infinite; }
  .lp-ember:nth-child(2)  { left: 18%; animation: lp-float-c 14s linear 1.5s  infinite; }
  .lp-ember:nth-child(3)  { left: 28%; animation: lp-float-b 10s linear 3s    infinite; }
  .lp-ember:nth-child(4)  { left: 37%; animation: lp-float-c  7s linear 0.5s  infinite; }
  .lp-ember:nth-child(5)  { left: 45%; animation: lp-float-a 16s linear 5s    infinite; }
  .lp-ember:nth-child(6)  { left: 53%; animation: lp-float-b  9s linear 2s    infinite; }
  .lp-ember:nth-child(7)  { left: 62%; animation: lp-float-c 12s linear 4s    infinite; }
  .lp-ember:nth-child(8)  { left: 71%; animation: lp-float-a  6s linear 1s    infinite; }
  .lp-ember:nth-child(9)  { left: 80%; animation: lp-float-b 11s linear 3.5s  infinite; }
  .lp-ember:nth-child(10) { left: 88%; animation: lp-float-a 18s linear 0s    infinite; }
  .lp-ember:nth-child(11) { left:  5%; animation: lp-float-c 15s linear 6s    infinite; }
  .lp-ember:nth-child(12) { left: 22%; animation: lp-float-b  8s linear 2.5s  infinite; }
  .lp-ember:nth-child(13) { left: 33%; animation: lp-float-a 13s linear 1s    infinite; }
  .lp-ember:nth-child(14) { left: 48%; animation: lp-float-c  7s linear 4.5s  infinite; }
  .lp-ember:nth-child(15) { left: 57%; animation: lp-float-a 17s linear 0.5s  infinite; }
  .lp-ember:nth-child(16) { left: 67%; animation: lp-float-b  9s linear 3s    infinite; }
  .lp-ember:nth-child(17) { left: 76%; animation: lp-float-a 11s linear 7s    infinite; }
  .lp-ember:nth-child(18) { left: 84%; animation: lp-float-c  6s linear 2s    infinite; }
  .lp-ember:nth-child(19) { left: 12%; animation: lp-float-b 14s linear 5.5s  infinite; }
  .lp-ember:nth-child(20) { left: 93%; animation: lp-float-b 10s linear 1.5s  infinite; }

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
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
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
    color: var(--text);
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
    color: var(--text);
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

  /* === ANTI-SECTION === */
  .lp-anti {
    padding: 4.5rem 2rem 8rem;
    text-align: center;
    position: relative;
    background-image:
      linear-gradient(rgba(10, 10, 12, 0.85), rgba(10, 10, 12, 0.85)),
      url('/images/anti-section-bg.webp');
    background-size: cover;
    background-position: center 70%;
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
    padding: 6rem 2rem 3rem;
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
    color: rgba(196, 85, 58, 0.3);
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

  /* === ORNAMENT === */
  /* === FINAL CTA (VOW) === */
  .lp-vow {
    padding: 3rem 2rem 8rem;
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


  /* Sway right-left-right, high peak opacity (large/close particles) */
  @keyframes lp-float-a {
    0%   { bottom: -5%;  opacity: 0;    transform: translateX(0px);   }
    12%  {               opacity: 0.9;                                }
    30%  {                              transform: translateX(20px);   }
    55%  {                              transform: translateX(-14px);  }
    78%  {                              transform: translateX(22px);   }
    88%  {               opacity: 0.3;                                }
    100% { bottom: 105%; opacity: 0;    transform: translateX(-6px);  }
  }

  /* Sway left-right, medium peak opacity */
  @keyframes lp-float-b {
    0%   { bottom: -5%;  opacity: 0;    transform: translateX(0px);   }
    12%  {               opacity: 0.75;                               }
    35%  {                              transform: translateX(-22px);  }
    60%  {                              transform: translateX(16px);   }
    82%  {               opacity: 0.25;                               }
    100% { bottom: 105%; opacity: 0;    transform: translateX(-10px); }
  }

  /* Gentle sway, lower peak opacity (small/distant particles) */
  @keyframes lp-float-c {
    0%   { bottom: -5%;  opacity: 0;    transform: translateX(0px);   }
    12%  {               opacity: 0.6;                                }
    40%  {                              transform: translateX(12px);   }
    65%  {                              transform: translateX(-18px);  }
    85%  {               opacity: 0.2;                                }
    100% { bottom: 105%; opacity: 0;    transform: translateX(8px);   }
  }

  /* === RESPONSIVE === */
  @media (max-width: 768px) {
    .lp-nav { padding: 1rem 1.5rem; }
    .lp-hero { padding: 6rem 1.5rem 4rem; }
    .lp-hero-dagger { font-size: 0.6rem; letter-spacing: 0.15em; }
    .lp-step { grid-template-columns: 50px 1fr; gap: 1rem; }
    .lp-step-num { font-size: 2rem; }
    .lp-anti,
    .lp-how,
    .lp-vow { padding-left: 1.5rem; padding-right: 1.5rem; }
  }
`;
