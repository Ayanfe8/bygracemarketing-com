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
  { n: "01", mark: "07.", title: "The 7-Point Business Growth Audit", meta: "21 questions, a 42-point score, and a clearer picture of where your business needs attention." },
  { n: "02", mark: "21.", title: "The Founder’s Growth Readiness Checklist", meta: "21 practical checks and a 30-day planner to help you act on what you discover." },
];

function StarterPackPage() {
  return (
    <StarterShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pt-10 pb-14 md:grid-cols-[1.2fr_1fr] md:gap-16 md:pt-20 md:pb-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-charcoal">Free business growth resources</p>
          <h1 className="mt-5 font-serif text-[2.4rem] leading-[1.05] text-ink sm:text-5xl md:text-[3.5rem]">
            Before you spend more on marketing, find out what’s holding your business back.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal">
            You could be posting consistently, paying for ads and showing up everywhere — yet still wondering why the enquiries aren’t turning into customers. Before you do more, find out what needs fixing.
          </p>
          <a href="#get" className="mt-8 inline-block bg-ink px-7 py-4 text-sm font-medium tracking-wide text-ivory hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            Get my free Starter Pack
          </a>
          <p className="mt-3 text-sm text-charcoal">2 value-packed free workbooks to help you spot the gaps and decide what to work on next.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 self-center">
          {BOOKS.map((b, i) => (
            <div key={b.n} className={`flex aspect-[6/9] flex-col justify-between border border-ink/80 bg-ink p-4 text-ivory sm:p-6 ${i ? "md:translate-y-8" : ""}`} aria-hidden>
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone">Workbook {b.n}</p>
              <p className="font-serif text-5xl leading-none sm:text-6xl">{b.mark}</p>
              <p className="font-serif text-sm leading-snug text-stone sm:text-base">{b.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="get" className="border-t border-stone">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-20">
          <div>
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">What’s inside your free Starter Pack</h2>
            <ul className="mt-8 divide-y divide-stone border-y border-stone">
              {BOOKS.map((b) => (
                <li key={b.n} className="py-5">
                  <p className="font-serif text-xl text-ink">{b.n} — {b.title}</p>
                  <p className="mt-1 text-sm text-charcoal">{b.meta}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-relaxed text-charcoal">Start with the audit. Use the checklist to take your next steps.</p>
            <p className="mt-4 text-sm text-charcoal">Made for founders, SME owners, consultants and purpose-led teams.</p>
          </div>
          <LeadForm />
        </div>
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
      if (!res.receipt) {
        setError("We could not process your request. Please try again.");
        return;
      }
      navigate({ to: "/resources/business-growth-starter-pack/thank-you", search: { t: res.receipt } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border border-stone bg-card p-6 sm:p-8" aria-describedby="form-note">
      <h2 className="font-serif text-2xl text-ink">Get your free workbooks</h2>
      <p id="form-note" className="mt-1 text-sm text-charcoal">Enter your name and email to request both resources.</p>

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
        <details className="group border-t border-stone pt-4">
          <summary className="cursor-pointer text-sm text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ink">
            Tell us a little about your business (optional)
          </summary>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-ink">
              Business name
              <input name="businessName" autoComplete="organization" maxLength={200} className={inputCls} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-ink">
                Business type
                <select name="businessType" defaultValue="" className={inputCls}>
                  <option value="">Select…</option>
                  {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block text-sm text-ink">
                Greatest challenge
                <select name="challenge" defaultValue="" className={inputCls}>
                  <option value="">Select…</option>
                  {CHALLENGES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
          </div>
        </details>
        {/* Honeypot */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 border-l-2 border-destructive pl-3 text-sm text-destructive">{error}</p>}

      <button type="submit" disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-ink px-6 py-4 text-sm font-medium tracking-wide text-ivory hover:bg-ink/90 disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {busy ? "Sending…" : "Get my free Starter Pack"}
      </button>
      <p className="mt-3 text-center text-xs text-charcoal">Free resources. No payment details required.</p>

      <div className="mt-6 space-y-3 border-t border-stone pt-5">
        <label className="flex gap-3 text-xs leading-snug text-charcoal">
          <input type="checkbox" name="marketing" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" />
          <span>Send me occasional marketing insights, resources and offers from Done For You by Grace. Unsubscribe anytime.</span>
        </label>
        <label className="flex gap-3 text-xs leading-snug text-charcoal">
          <input type="checkbox" name="waitlist" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" />
          <span>Tell me when The Visibility-to-Revenue Playbook is available (no other emails).</span>
        </label>
        <p className="text-xs text-charcoal">
          Optional — your workbooks are free either way. <Link to="/privacy" className="underline">Privacy notice</Link>.
        </p>
      </div>
    </form>
  );
}
