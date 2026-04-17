import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Duskvow",
  description:
    "What Duskvow collects, why, who processes it, and how to see, export, or delete your data.",
};

const LAST_UPDATED = "17 April 2026";

export default function PrivacyPage() {
  return (
    <main className="legal-root">
      <style>{legalStyles}</style>

      <div className="legal-noise" aria-hidden="true" />

      <nav className="legal-nav">
        <Link href="/" className="legal-logo">
          Dusk<span>vow</span>
        </Link>
        <Link href="/terms" className="legal-link">
          Terms
        </Link>
      </nav>

      <article className="legal-article">
        <p className="legal-eyebrow">◆ &nbsp; Privacy Policy &nbsp; ◆</p>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: {LAST_UPDATED}</p>

        <p className="legal-intro">
          Duskvow exists to help you turn a goal into a path you can walk. To do
          that we have to store a few things — your account, your goals, the
          steps you&apos;ve completed. This page explains exactly what we collect,
          why, who else sees it, and how you can get it out or delete it.
        </p>

        <div className="legal-divider" aria-hidden="true" />

        <section>
          <h2>1. What we collect</h2>
          <ul>
            <li>
              <strong>Account:</strong> email address. If you sign in with
              Google we also receive your Google display name, which becomes
              your initial <code>display_name</code> until you set a hero name.
            </li>
            <li>
              <strong>Hero identity:</strong> the hero name you choose.
            </li>
            <li>
              <strong>Goals:</strong> the text you type when creating a vow, and
              the follow-up answers you pick.
            </li>
            <li>
              <strong>Progression:</strong> which nodes you&apos;ve completed,
              XP, level, streaks, daily activity dates, embers, dungeon runs,
              inventory, achievements.
            </li>
            <li>
              <strong>Technical:</strong> authentication tokens, approximate
              geographic region derived from your IP (standard server logs).
            </li>
            <li>
              <strong>Analytics (only if you accept):</strong> anonymised page
              visits and performance metrics via Vercel Analytics and Speed
              Insights. If you decline the banner we do not run these.
            </li>
          </ul>
        </section>

        <section>
          <h2>2. Why we collect it</h2>
          <ul>
            <li>Authenticate you and keep your account safe.</li>
            <li>Generate your talent tree from your goal.</li>
            <li>Track your progress and display it back to you.</li>
            <li>Debug errors and improve performance.</li>
            <li>Nothing else. We do not sell data. We do not run ads.</li>
          </ul>
        </section>

        <section id="ai">
          <h2>3. Third parties who process your data</h2>
          <p>
            Duskvow is a thin shell over a few service providers. Each of them
            has their own terms and privacy policies.
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> — authentication + database. Stores
              everything in section 1.
            </li>
            <li>
              <strong>Google Gemini</strong> — when you create a vow, the text
              of your goal and your follow-up answers are sent to Google&apos;s
              Gemini API to generate the tree. Google states that prompts sent
              to the Gemini API (paid tier) are not used to train their models.
              Duskvow does not send any other personal information to Gemini.
            </li>
            <li>
              <strong>Vercel</strong> — frontend hosting. Analytics and Speed
              Insights only run if you accept the consent banner.
            </li>
            <li>
              <strong>Railway</strong> — backend hosting. Processes API
              requests; does not retain the content of those requests beyond
              standard access logs.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. How long we keep it</h2>
          <ul>
            <li>
              <strong>Account &amp; progression:</strong> for as long as your
              account exists.
            </li>
            <li>
              <strong>Deleted trees:</strong> soft-deleted (marked hidden) for
              up to 90 days, then hard-deleted.
            </li>
            <li>
              <strong>Server access logs:</strong> typical Railway/Vercel
              retention (30–90 days).
            </li>
            <li>
              <strong>Analytics:</strong> per Vercel&apos;s retention policy.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Your rights</h2>
          <p>
            You have the right to see, export, correct, and delete your data.
            All four are one click each from your profile page:
          </p>
          <ul>
            <li>
              <strong>See:</strong> the <Link href="/profile">Profile</Link>{" "}
              page shows everything we store about your progression.
            </li>
            <li>
              <strong>Export:</strong> &quot;Export My Data&quot; downloads a
              JSON file with your profile, trees, embers, achievements,
              inventory, and dungeon history.
            </li>
            <li>
              <strong>Delete:</strong> &quot;Unbind Your Vow&quot; removes your
              account and everything connected to it. This is irreversible.
            </li>
            <li>
              <strong>Correct:</strong> hero name can be changed from the
              profile; other fields are derived from your activity.
            </li>
          </ul>
          <p>
            If the in-app controls don&apos;t work for you, email us (below) and
            we&apos;ll do it by hand.
          </p>
        </section>

        <section>
          <h2>6. Cookies &amp; similar storage</h2>
          <p>
            We use first-party cookies for two things:
          </p>
          <ul>
            <li>
              <strong>Authentication session</strong> (Supabase). Needed for
              sign-in to work.
            </li>
            <li>
              <strong>Consent state</strong> — a tiny cookie remembering
              whether you accepted or declined analytics.
            </li>
          </ul>
          <p>
            If you accept the consent banner, Vercel Analytics and Speed
            Insights set their own identifiers. Declining suppresses both.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            All traffic is over HTTPS. Writes to the database go through a
            service-role backend that verifies ownership on every request. The
            browser cannot write to tables directly. We apply best-effort
            security practices but cannot promise any system is unbreakable.
          </p>
        </section>

        <section>
          <h2>8. Changes to this policy</h2>
          <p>
            When this policy changes we update the date at the top. Material
            changes will also surface as a banner the next time you sign in.
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
  .legal-article code {
    font-family: ui-monospace, monospace;
    background: var(--bg-shadow);
    border: 1px solid var(--border-muted);
    padding: 0.1rem 0.4rem;
    border-radius: 2px;
    font-size: 0.85em;
    color: var(--text-primary);
  }
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
