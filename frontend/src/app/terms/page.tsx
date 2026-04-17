import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Duskvow",
  description: "Terms governing your use of Duskvow.",
};

const LAST_UPDATED = "17 April 2026";

export default function TermsPage() {
  return (
    <main className="legal-root">
      <style>{legalStyles}</style>

      <div className="legal-noise" aria-hidden="true" />

      <nav className="legal-nav">
        <Link href="/" className="legal-logo">
          Dusk<span>vow</span>
        </Link>
        <Link href="/privacy" className="legal-link">
          Privacy
        </Link>
      </nav>

      <article className="legal-article">
        <p className="legal-eyebrow">◆ &nbsp; Terms of Service &nbsp; ◆</p>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: {LAST_UPDATED}</p>

        <p className="legal-intro">
          These are the terms for using Duskvow. Plain English. By creating an
          account or using the app you&apos;re agreeing to them.
        </p>

        <div className="legal-divider" aria-hidden="true" />

        <section>
          <h2>1. What Duskvow is</h2>
          <p>
            Duskvow turns a goal you speak into a talent tree of concrete steps.
            You walk the steps at your own pace. The service is provided as-is,
            and is a self-improvement tool — not medical, legal, or financial
            advice.
          </p>
        </section>

        <section>
          <h2>2. Your account</h2>
          <ul>
            <li>
              You must be old enough to form a contract where you live
              (generally 16+ in the EU, 13+ elsewhere with guardian consent).
            </li>
            <li>
              Keep your password to yourself. You&apos;re responsible for
              activity under your account.
            </li>
            <li>One account per person.</li>
            <li>
              You can delete your account at any time from your profile page.
              Deletion is permanent.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Your content</h2>
          <p>
            You own what you type. The goal text you enter, the hero name you
            choose, the notes or descriptions you add — they&apos;re yours. By
            using Duskvow you give us the limited right to store that content
            and to send your goal to Google Gemini so we can generate your
            tree. We do not sell your content. We do not use it to train AI
            models.
          </p>
        </section>

        <section>
          <h2>4. The AI output</h2>
          <p>
            Talent trees, daily quests, and in-game flavour text are generated
            by a language model. We review prompts and apply structural
            validation, but AI outputs can be wrong, weird, or incomplete. Use
            judgement. If a suggested step is unsafe or doesn&apos;t fit your
            situation, ignore it.
          </p>
        </section>

        <section>
          <h2>5. Acceptable use</h2>
          <p>Don&apos;t:</p>
          <ul>
            <li>Use Duskvow to plan or promote illegal activity.</li>
            <li>Attempt to scrape, probe, or overload the service.</li>
            <li>Impersonate another person or misrepresent your identity.</li>
            <li>
              Use another user&apos;s account, or share an account with another
              person.
            </li>
            <li>Upload or store malware, or try to exploit the AI prompt.</li>
          </ul>
          <p>
            We can suspend or terminate an account that does any of the above,
            with or without notice.
          </p>
        </section>

        <section>
          <h2>6. Service availability</h2>
          <p>
            Duskvow is an early-stage product. Features can change. Downtime
            can happen. We will try to communicate large changes in advance, but
            we can&apos;t promise any uptime level.
          </p>
        </section>

        <section>
          <h2>7. Fees</h2>
          <p>
            At the time this document was last updated, Duskvow is free to use.
            If we introduce paid features we&apos;ll be clear about the price
            before you pay, and paid features will not retroactively take away
            what was free.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            You can stop using Duskvow and delete your account at any time. We
            can also close accounts that violate these terms. On termination
            your data is deleted as described in the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers &amp; liability</h2>
          <p>
            Duskvow is provided &ldquo;as is&rdquo; without warranties of any
            kind. To the maximum extent permitted by law, we are not liable for
            indirect, incidental, or consequential damages arising from your use
            of the service. Where the law gives you rights that can&apos;t be
            limited by contract, those rights still apply.
          </p>
        </section>

        <section>
          <h2>10. Changes to these terms</h2>
          <p>
            When these terms change we update the date at the top. If the
            change is material we&apos;ll surface it the next time you sign in.
            Continuing to use Duskvow after a change means you accept the new
            terms.
          </p>
        </section>

        <div className="legal-divider" aria-hidden="true" />

        <p className="legal-footer-note">
          Tempered by ambition. Tended by hand.
        </p>
      </article>
    </main>
  );
}

const legalStyles = `
  .legal-root {
    min-height: 100vh;
    background: var(--bg-abyss);
    color: var(--text-secondary);
    font-family: var(--font-crimson), Georgia, serif;
    font-size: 17px;
    line-height: 1.75;
    position: relative;
    padding-bottom: 6rem;
  }
  .legal-noise {
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
    z-index: 1;
  }
  .legal-nav {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-muted);
  }
  .legal-logo {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--bone);
  }
  .legal-logo span { color: var(--logo-ember); }
  .legal-link {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .legal-link:hover { color: var(--text-secondary); }

  .legal-article {
    position: relative;
    z-index: 2;
    max-width: 720px;
    margin: 0 auto;
    padding: 4rem 1.5rem 2rem;
  }
  .legal-eyebrow {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold-dim);
    text-align: center;
    margin-bottom: 1.25rem;
  }
  .legal-article h1 {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 700;
    font-size: clamp(2rem, 5vw, 2.8rem);
    color: var(--bone);
    text-align: center;
    letter-spacing: 0.05em;
    margin: 0 0 0.4rem;
  }
  .legal-updated {
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 2.5rem;
  }
  .legal-intro {
    color: var(--text-primary);
    margin-bottom: 2rem;
  }
  .legal-article h2 {
    font-family: var(--font-cinzel), 'Cinzel', serif;
    font-weight: 600;
    font-size: 1.2rem;
    letter-spacing: 0.08em;
    color: var(--text-primary);
    margin: 2.25rem 0 0.75rem;
  }
  .legal-article section { margin-bottom: 1rem; }
  .legal-article p { margin: 0 0 1rem; }
  .legal-article ul {
    padding-left: 1.4rem;
    margin: 0 0 1rem;
  }
  .legal-article li { margin-bottom: 0.55rem; }
  .legal-article a {
    color: var(--accent-gold);
    text-decoration: underline;
    text-decoration-color: rgba(255, 215, 0, 0.35);
    text-underline-offset: 2px;
  }
  .legal-article a:hover { text-decoration-color: var(--accent-gold); }
  .legal-article strong {
    color: var(--text-primary);
    font-weight: 500;
  }
  .legal-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
    margin: 3rem 0 2rem;
  }
  .legal-footer-note {
    text-align: center;
    font-style: italic;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
`;
