import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { StarterShell, BookCover } from "@/components/starter-pack/shell";
import { submitResourceLead, BUSINESS_TYPES, CHALLENGES } from "@/lib/resource-leads.functions";

const TITLE = "Free Business Growth Starter Pack | Done For You by Grace";
const DESC =
  "Two free workbooks for founders: the 7-Point Business Growth Audit and the Founder’s Growth Readiness Checklist. Find what is holding your growth back and act on it.";

export const Route = createFileRoute("/resources/business-growth-starter-pack/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "https://bygracemarketing.com/resources/business-growth-starter-pack" }],
  }),
  component: StarterPackPage,
});

const BOOKS = [
  {
    kicker: "Workbook 01",
    title: "The 7-Point Business Growth Audit",
    sub: "21 diagnostic questions",
    body: "21 diagnostic questions across brand positioning, customer understanding, discoverability, marketing effectiveness, sales conversion, retention and growth measurement. Score your business out of 42 and find where to focus.",
  },
  {
    kicker: "Workbook 02",
    title: "The Founder’s Growth Readiness Checklist",
    sub: "21 actions · 30-day planner",
    body: "21 practical actions and a 30-day planner that turns your audit findings into focused improvements.",
  },
];

const BENEFITS = [
  "Identify overlooked gaps",
  "Understand your priorities",
  "Take practical next steps",
  "Revisit every quarter",
];

function StarterPackPage() {
  return (
    <StarterShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pt-12 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-charcoal">
            A complimentary resource bundle from Done For You by Grace
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.08] text-ink sm:text-5xl md:text-[3.4rem]">
            Your business might not need more marketing. It might need a clearer picture of what is holding it back.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal">
            Two practical workbooks to help founders identify the gaps in their business growth and take focused action.
          </p>
          <div className="mt-10 flex items-end gap-4">
            <BookCover {...BOOKS[0]} />
            <div className="w-[85%] max-w-[190px] translate-y-4">
              <BookCover {...BOOKS[1]} />
            </div>
          </div>
          <p className="mt-8 text-xs text-charcoal">Cover illustrations are representative of the digital workbooks.</p>
        </div>
        <div id="get" className="md:pt-4">
          <LeadForm />
        </div>
      </section>

      <section className="border-y border-stone bg-background/40">
        <div className="mx-auto grid max-w-6xl gap-px px-5 py-14 md:grid-cols-2 md:gap-12">
          {BOOKS.map((b) => (
            <article key={b.title} className="py-6">
              <p className="text-xs uppercase tracking-[0.2em] text-charcoal">{b.kicker}</p>
              <h2 className="mt-3 font-serif text-3xl text-ink">{b.title}</h2>
              <p className="mt-4 leading-relaxed text-charcoal">{b.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-3xl text-ink">What the Starter Pack helps you do</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <li key={b} className="border-t border-ink pt-4">
              <span className="text-xs text-charcoal">0{i + 1}</span>
              <p className="mt-2 font-serif text-xl text-ink">{b}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-serif text-2xl text-ink">Who it is for</h3>
            <p className="mt-3 leading-relaxed text-charcoal">
              SME founders, business owners, consultants and purpose-led organisations who want a clearer view of where growth is getting stuck.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-ink">A note before you start</h3>
            <p className="mt-3 leading-relaxed text-charcoal">
              These are free, self-guided digital workbooks. They are not a personal diagnosis of your business and do not guarantee financial results. They are designed to help you think clearly and act with focus.
            </p>
          </div>
        </div>
        <a
          href="#get"
          className="mt-12 inline-block bg-ink px-7 py-4 text-sm font-medium tracking-wide text-ivory hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Get the free Starter Pack
        </a>
      </section>
    </StarterShell>
  );
}

const inputCls =
  "mt-1 w-full border border-stone bg-ivory px-3 py-2.5 text-ink placeholder:text-charcoal/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

function LeadForm() {
  const submit = useServerFn(submitResourceLead);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ name?: string; email?: string }>({});
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
      const v = p.get(k);
      if (v) out[k] = v.slice(0, 150);
    });
    setUtm(out);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const errs: typeof fieldErr = {};
    if (!name) errs.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    setFieldErr(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await submit({
        data: {
          name,
          email,
          businessName: String(f.get("businessName") ?? "") || null,
          businessType: (String(f.get("businessType") ?? "") || null) as never,
          challenge: (String(f.get("challenge") ?? "") || null) as never,
          marketingConsent: f.get("marketing") === "on",
          waitlist: f.get("waitlist") === "on",
          website: String(f.get("website") ?? ""),
          source: "starter_pack_page",
          ...utm,
        },
      });
      if (!res.token) {
        setError("We could not process your request. Please try again.");
        return;
      }
      navigate({ to: "/resources/business-growth-starter-pack/thank-you", search: { t: res.token } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border border-stone bg-card p-6 sm:p-8" aria-describedby="form-note">
      <h2 className="font-serif text-2xl text-ink">Get the free Starter Pack</h2>
      <p id="form-note" className="mt-1 text-sm text-charcoal">Both workbooks, sent to your inbox.</p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-ink">
          Name <span aria-hidden>*</span>
          <input name="name" autoComplete="name" required maxLength={120} className={inputCls}
            aria-invalid={!!fieldErr.name} aria-describedby={fieldErr.name ? "err-name" : undefined} />
          {fieldErr.name && <span id="err-name" className="mt-1 block text-xs text-destructive">{fieldErr.name}</span>}
        </label>
        <label className="block text-sm text-ink">
          Email <span aria-hidden>*</span>
          <input name="email" type="email" autoComplete="email" required maxLength={255} className={inputCls}
            aria-invalid={!!fieldErr.email} aria-describedby={fieldErr.email ? "err-email" : undefined} />
          {fieldErr.email && <span id="err-email" className="mt-1 block text-xs text-destructive">{fieldErr.email}</span>}
        </label>
        <label className="block text-sm text-ink">
          Business name <span className="text-charcoal">(optional)</span>
          <input name="businessName" autoComplete="organization" maxLength={200} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-ink">
            Business type <span className="text-charcoal">(optional)</span>
            <select name="businessType" defaultValue="" className={inputCls}>
              <option value="">Select…</option>
              {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block text-sm text-ink">
            Greatest challenge <span className="text-charcoal">(optional)</span>
            <select name="challenge" defaultValue="" className={inputCls}>
              <option value="">Select…</option>
              {CHALLENGES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        {/* Honeypot */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <label className="flex gap-3 text-sm leading-snug text-charcoal">
          <input type="checkbox" name="marketing" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" />
          <span>Yes, send me practical marketing insights, resources and occasional offers from Done For You by Grace. I can unsubscribe anytime.</span>
        </label>
        <label className="flex gap-3 text-sm leading-snug text-charcoal">
          <input type="checkbox" name="waitlist" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" />
          <span>Tell me when The Visibility-to-Revenue Playbook is available (early access only, no other emails).</span>
        </label>
      </div>

      {error && <p role="alert" className="mt-5 border-l-2 border-destructive pl-3 text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-ink px-6 py-4 text-sm font-medium tracking-wide text-ivory hover:bg-ink/90 disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {busy ? "Sending…" : "Get the free Starter Pack"}
      </button>
      <p className="mt-4 text-xs text-charcoal">
        The download is free whether or not you tick the boxes. See our <Link to="/privacy" className="underline">privacy notice</Link>.
      </p>
    </form>
  );
}
