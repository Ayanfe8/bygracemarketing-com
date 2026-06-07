import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ArrowRight,
  Check,
  Mail,
  Linkedin,
  Target,
  Sparkles,
  PenTool,
  Compass,
  Calendar,
  MessageCircle,
  Plus,
  Lock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingUnlockProvider, usePricingUnlock, rateCards } from "@/components/pricing-unlock";
import { supabase } from "@/integrations/supabase/client";
import { notifyLead } from "@/lib/notify-lead.functions";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import logoAsset from "@/assets/dfy-logo.png.asset.json";
import heroAsset from "@/assets/grace-mac.jpg.asset.json";
const heroImg = heroAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Done For You by Grace — Marketing That Grows Your Business" },
      {
        name: "description",
        content:
          "Full-service marketing for small businesses. Brand strategy, LinkedIn optimisation, email marketing, lead generation and design — done for you.",
      },
      { property: "og:title", content: "Done For You by Grace — Marketing That Grows Your Business" },
      {
        property: "og:description",
        content:
          "You run the business. We handle the marketing. Practical, professional, done-for-you support for founders and small businesses.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: logoAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: logoAsset.url },
    ],
    links: [
      { rel: "canonical", href: "/" },
    ],
  }),
  component: Landing,
});

const services = [
  {
    icon: Compass,
    title: "Brand Strategy",
    desc: "We define your positioning, messaging and offer structure so your brand is clear before it's visible.",
    fit: "For businesses that need clarity before visibility.",
  },
  {
    icon: Linkedin,
    title: "LinkedIn Optimisation",
    desc: "Position your profile or company page to attract the right audience, build authority and unlock opportunities.",
    fit: "For founders, consultants and B2B service providers.",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    desc: "Campaigns, newsletters and nurture sequences that turn your list into real conversations and conversions.",
    fit: "For businesses with a list ready to convert.",
  },
  {
    icon: Target,
    title: "Lead Generation",
    desc: "Simple, practical systems to identify, attract and engage qualified potential clients.",
    fit: "For businesses ready for more sales conversations.",
  },
  {
    icon: PenTool,
    title: "Graphic Design",
    desc: "Clean, on-brand visuals for social, campaigns, flyers and presentations that look as good as you are.",
    fit: "For brands ready to look the part.",
  },
  {
    icon: Sparkles,
    title: "Content Direction",
    desc: "Know exactly what to post, why, and how — a structured content plan that supports your growth goals.",
    fit: "For founders tired of guessing what to say.",
  },
];

const steps = [
  { n: "01", title: "Book a Free Consultation", desc: "A simple conversation about your business, goals and where you need support." },
  { n: "02", title: "Get a Clear Direction", desc: "We identify what to fix, improve or create to attract better results." },
  { n: "03", title: "We Execute For You", desc: "We agree the right package and handle the marketing deliverables." },
  { n: "04", title: "You Show Up Better", desc: "Clearer brand, stronger communication, business ready for growth." },
];

const packages = [
  {
    name: "Starter Support",
    tag: "Foundations",
    price: "₦150,000",
    priceUsd: "$170",
    cadence: "/month",
    desc: "For businesses that need simple brand and marketing improvements.",
    features: ["Brand messaging refresh", "Basic design support", "Social media direction", "LinkedIn optimisation"],
  },
  {
    name: "Growth Support",
    tag: "Most popular",
    featured: true,
    price: "₦350,000",
    priceUsd: "$300",
    cadence: "/month",
    desc: "For businesses that need consistent marketing execution.",
    features: [
      "Brand & content strategy",
      "Email marketing support",
      "On-brand design assets",
      "Lead generation guidance",
      "Monthly direction calls",
    ],
  },
  {
    name: "Premium Support",
    tag: "Full service",
    price: "₦650,000",
    priceUsd: "$500",
    cadence: "/month",
    desc: "For businesses that need full marketing execution, ongoing.",
    features: [
      "Brand strategy & positioning",
      "LinkedIn optimisation",
      "Email marketing campaigns",
      "Lead generation systems",
      "Campaign & design support",
    ],
  },
];

const comparison = [
  { feature: "Brand messaging & positioning", starter: "Basic refresh", growth: "Full strategy", premium: "Full strategy + repositioning" },
  { feature: "Graphic design assets", starter: "2 / month", growth: "6 / month", premium: "Unlimited requests" },
  { feature: "LinkedIn optimisation", starter: true, growth: true, premium: true },
  { feature: "Email marketing", starter: false, growth: "Monthly campaign", premium: "Weekly campaigns + automations" },
  { feature: "Lead generation systems", starter: false, growth: "Guidance only", premium: "Done-for-you setup" },
  { feature: "Content calendar & captions", starter: "Direction only", growth: "Monthly calendar", premium: "Weekly content + scheduling" },
  { feature: "Strategy calls", starter: "Quarterly", growth: "Monthly", premium: "Bi-weekly" },
  { feature: "Turnaround time", starter: "5 working days", growth: "3 working days", premium: "48 hours" },
  { feature: "Dedicated account manager", starter: false, growth: false, premium: true },
];

const testimonials = [
  {
    quote:
      "Before working with Grace, my LinkedIn was just sitting there. Within two months, three serious clients reached out — one of them is now on retainer. She really gets it.",
    name: "Chinonso",
    role: "Founder",
  },
  {
    quote:
      "I run a small skincare brand in Abuja and I was tired of posting and getting nothing back. Grace took over the strategy and our DMs have not been the same since. Sales doubled by the third month.",
    name: "Adaeze",
    role: "CEO",
  },
  {
    quote:
      "Honestly, I was sceptical at first. But the brand refresh and email sequence she set up brought in clients I had been chasing for over a year. Worth every kobo.",
    name: "Alfred",
    role: "Principal Partner",
  },
  {
    quote:
      "Grace is calm, organised and very strategic. She helped me stop guessing and start showing up properly online. My business finally looks like the business I always knew it could be.",
    name: "Esther",
    role: "Interior Designer",
  },
];

const audiences = [
  "Small business owners",
  "Service-based businesses",
  "Founders & consultants",
  "Real estate professionals",
  "Coaches & trainers",
  "Startups & growing brands",
  "Personal brands",
  "Local businesses",
];

function Landing() {
  return (
    <PricingUnlockProvider>
      <LandingInner />
    </PricingUnlockProvider>
  );
}

function LandingInner() {
  const [open, setOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", business: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const business = contactForm.business.trim();
    const message = contactForm.message.trim();
    if (!name || !email || !message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("pricing_leads").insert({
        name,
        email,
        business: business || null,
        message,
        source: "contact_form",
      });
      if (error) throw error;
      notifyLead({
        data: { name, email, business: business || null, message, source: "contact_form" },
      }).catch((err) => console.error("notifyLead failed", err));
      trackEvent("lead_submitted", { source: "contact_form", has_business: Boolean(business) });
      setOpen(true);
      setContactForm({ name: "", email: "", business: "", message: "" });
    } catch (err) {
      console.error("Contact submit failed", err);
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };
  const { unlocked, openGate } = usePricingUnlock();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Done For You by Grace" className="h-10 w-10 rounded-full object-cover" />
            <div className="leading-tight hidden sm:block">
              <div className="font-serif text-base text-primary tracking-wide">Done For You</div>
              <div className="font-script text-sm -mt-1 text-gold">by Grace</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#process" className="hover:text-primary transition-colors">Process</a>
            <a href="#packages" className="hover:text-primary transition-colors">Packages</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <Button asChild variant="default" className="bg-primary hover:bg-navy-deep text-primary-foreground rounded-full px-5">
            <a href="#contact">Book a call</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="bg-gradient-hero relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/60 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Marketing that grows your business
            </div>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl text-primary leading-[1.05]">
              You run the business.
              <span className="block italic text-gold font-script text-4xl md:text-5xl lg:text-6xl mt-2">we handle</span>
              <span className="block">the marketing.</span>
            </h1>
            <p className="mt-7 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Full-service marketing support for small businesses that want to look better, attract
              more clients, and grow consistently — without doing everything themselves.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-navy-deep text-primary-foreground rounded-full px-7 h-12 shadow-elegant">
                <a href="#contact">
                  Book a Free Consultation
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
              <a href="#services" className="text-sm text-primary underline-offset-4 hover:underline">
                See what we do →
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> Strategy + execution</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> On-brand design</div>
              <div className="flex items-center gap-2 hidden sm:flex"><Check className="h-4 w-4 text-gold" /> Real conversions</div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-elegant">
              <img src={heroImg} alt="Grace, founder of Done For You by Grace" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-5 shadow-soft border border-border w-56 hidden sm:block">
              <div className="text-xs uppercase tracking-widest text-gold">Done For You</div>
              <div className="mt-1 font-serif text-xl text-primary leading-tight">Show up, stand out, grow.</div>
            </div>
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs uppercase tracking-widest shadow-elegant hidden sm:block">
              by Grace
            </div>
          </div>
        </div>
      </section>

      {/* Pain section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-gold">The honest truth</div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-primary leading-tight">
            Is your business good, but your marketing isn't showing it?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            You have the product. You have the service. You have the experience. You probably even have happy customers.
            But your online presence doesn't fully reflect the quality of what you offer.
          </p>

          <div className="mt-12 grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Your brand looks inconsistent across channels",
              "Your content isn't attracting the right people",
              "Your LinkedIn or socials need real work",
              "You want to generate leads but don't know where to start",
              "You're too busy running the business to also run marketing",
              "You've tried freelancers but nothing felt cohesive",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <div className="mt-1 h-2 w-2 rounded-full bg-gold flex-shrink-0" />
                <p className="text-sm text-foreground">{p}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 font-serif italic text-2xl text-primary">That is where we come in.</p>
        </div>
      </section>

      {/* Promise */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-gold">Our promise</div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
            Marketing that is <span className="italic text-gold">actually</span> done for you.
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-3xl mx-auto">
            We don't just tell you what to do. We help you do it. Strategy, design, content and execution
            brought together so your business shows up with more confidence and clarity.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Our services</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Everything your marketing needs, in one place.</h2>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, fit }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-border bg-card p-7 transition-all hover:shadow-elegant hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground shadow-soft">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-serif text-2xl text-primary">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                <p className="mt-4 text-xs italic text-gold">{fit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-5xl px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Why work with us</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary leading-tight">
              Because marketing shouldn't feel like confusion dressed in Canva templates.
            </h2>
          </div>
          <div className="space-y-5">
            {[
              ["From scattered", "to structured."],
              ["From inconsistent", "to professional."],
              ['From "I need to post something"', '"this is part of a clear growth plan."'],
            ].map(([a, b], i) => (
              <div key={i} className="flex items-baseline gap-4 border-l-2 border-gold pl-5">
                <span className="font-serif text-lg text-muted-foreground">{a}</span>
                <span className="font-serif text-2xl text-primary">→ {b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-gold">Who we work with</div>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Built for businesses ready to grow.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {audiences.map((a) => (
              <span key={a} className="rounded-full border border-border bg-card px-5 py-2 text-sm text-foreground">
                {a}
              </span>
            ))}
          </div>
          <p className="mt-10 text-muted-foreground max-w-2xl mx-auto">
            If you know your business needs better marketing — but you don't have the time, skill or team
            to execute it properly — this is for you.
          </p>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="bg-gradient-hero py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">How it works</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Simple, clear, and built around your business.</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl bg-card p-7 border border-border shadow-soft">
                <div className="font-serif text-5xl text-gold">{s.n}</div>
                <h3 className="mt-4 font-serif text-xl text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Choose your support</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">Done-for-you packages.</h2>
            <p className="mt-4 text-muted-foreground">Not sure what you need? Book a free consultation and we'll recommend the best fit.</p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {packages.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-8 border transition-all flex flex-col ${
                  p.featured
                    ? "bg-primary text-primary-foreground border-primary shadow-elegant lg:-translate-y-4"
                    : "bg-card border-border shadow-soft"
                }`}
              >
                <div className={`text-xs uppercase tracking-widest ${p.featured ? "text-gold" : "text-gold"}`}>
                  {p.tag}
                </div>
                <h3 className={`mt-3 font-serif text-3xl ${p.featured ? "text-primary-foreground" : "text-primary"}`}>
                  {p.name}
                </h3>
                <div className="mt-4 flex flex-col gap-1">
                  {unlocked ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className={`font-serif text-4xl ${p.featured ? "text-gold" : "text-primary"}`}>{p.price}</span>
                        <span className={`text-sm ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.cadence}</span>
                      </div>
                      <div className={`text-xs ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        International: <span className={`font-medium ${p.featured ? "text-gold" : "text-primary"}`}>{p.priceUsd}</span>{p.cadence}
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openGate("pricing-card")}
                      className={`font-serif text-2xl tracking-widest flex items-center gap-2 hover:opacity-80 transition ${p.featured ? "text-gold" : "text-primary"}`}
                      aria-label="Unlock pricing"
                    >
                      <Lock className="h-4 w-4" />
                      ₦ • • • • • •  /  $ • • •
                    </button>
                  )}
                </div>
                <p className={`mt-3 text-sm ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {p.desc}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${p.featured ? "text-gold" : "text-gold"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  onClick={() => openGate("pricing-card")}
                  className={`mt-8 rounded-full h-11 ${
                    p.featured
                      ? "bg-gold hover:bg-gold/90 text-primary"
                      : "bg-primary hover:bg-navy-deep text-primary-foreground"
                  }`}
                >
                  {unlocked ? (
                    <><Download className="mr-2 h-4 w-4" /> Download rate card</>
                  ) : (
                    <><Lock className="mr-2 h-4 w-4" /> Unlock pricing</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Compare plans</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">See what's included.</h2>
            <p className="mt-4 text-muted-foreground">A side-by-side look at how each package supports your business.</p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-6 py-5 font-medium">Feature</th>
                  <th className="px-6 py-5 font-medium text-center">Starter</th>
                  <th className="px-6 py-5 font-medium text-center bg-navy-deep">
                    <span className="block">Growth</span>
                    <span className="text-[10px] uppercase tracking-widest text-gold">Most popular</span>
                  </th>
                  <th className="px-6 py-5 font-medium text-center">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? "bg-background/50" : ""}>
                    <td className="px-6 py-4 font-medium text-primary">{row.feature}</td>
                    {(["starter", "growth", "premium"] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="px-6 py-4 text-center text-muted-foreground">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check className="inline h-4 w-4 text-gold" />
                            ) : (
                              <span className="text-border">—</span>
                            )
                          ) : (
                            val
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-background/50">
                  <td className="px-6 py-5 font-serif text-primary">Monthly investment</td>
                  {([
                    { ngn: "₦150,000", usd: "$170" },
                    { ngn: "₦350,000", usd: "$300" },
                    { ngn: "₦650,000", usd: "$500" },
                  ] as const).map((price, i) => (
                    <td key={i} className="px-6 py-5 text-center font-serif text-lg text-primary">
                      {unlocked ? (
                        <div className="flex flex-col items-center">
                          <span>{price.ngn}</span>
                          <span className="text-xs text-muted-foreground font-sans mt-1">or {price.usd} (intl.)</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openGate("comparison-table")}
                          className="inline-flex items-center gap-2 text-primary/70 hover:text-primary transition"
                        >
                          <Lock className="h-4 w-4" /> Unlock
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              onClick={() => openGate("comparison-cta")}
              size="lg"
              className="bg-primary hover:bg-navy-deep text-primary-foreground rounded-full h-12 px-6"
            >
              {unlocked ? (
                <><Download className="mr-2 h-4 w-4" /> Download the full rate card</>
              ) : (
                <><Lock className="mr-2 h-4 w-4" /> Get the full rate card</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              {unlocked
                ? "All 4 PDFs are available — share them with anyone."
                : "Free PDF. We'll just need your name and email."}
            </p>
          </div>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Custom packages available on request. International clients billed in USD equivalent.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/40 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Client love</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">What clients are saying.</h2>
            <p className="mt-4 text-muted-foreground">Real results from founders and business owners across Nigeria.</p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl bg-card border border-border p-8 shadow-soft flex flex-col"
              >
                <div className="text-gold text-3xl font-serif leading-none">"</div>
                <blockquote className="mt-2 text-base text-foreground/90 italic leading-relaxed flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border">
                  <div className="font-serif text-primary text-lg">{t.name}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>



      {/* Big CTA */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-4xl md:text-6xl leading-tight">
            Your business deserves marketing that <span className="italic text-gold">works while you work.</span>
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Stop guessing what to post, how to position your brand or how to attract clients.
            Focus on running your business — we'll help you show up, stand out, and grow.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 bg-gold hover:bg-gold/90 text-primary rounded-full px-8 h-12 shadow-elegant"
          >
            <a href="#contact">
              Book a Free Consultation
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 lg:py-32 bg-muted/40">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">FAQs</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">
              Questions, answered.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you might be wondering before we start working together.
            </p>
          </div>

          <div className="mt-12 divide-y divide-border rounded-3xl border border-border bg-background">
            {[
              { q: "How quickly can we get started?", a: "Once you book a free consultation and we agree on a package, we usually kick off within 3 to 5 working days. Onboarding is simple — a short brand questionnaire, one strategy call, and we begin." },
              { q: "Do I have to sign a long-term contract?", a: "No. All packages run month-to-month. Most clients stay because the results speak for themselves, but you are never locked in." },
              { q: "What if I am not sure which package fits my business?", a: "That is exactly what the free consultation is for. We will look at where your business is now, what you actually need, and recommend the most sensible starting point — no pressure to upgrade." },
              { q: "Do you only work with Nigerian businesses?", a: "No. We work with small businesses, founders and consultants across Africa, the UK and beyond. Marketing principles travel — strategy is tailored to your market." },
              { q: "Will I still need to post and reply to clients myself?", a: "We handle the strategy, design and execution. You stay in charge of your voice and your customer relationships. We make showing up online much lighter — not invisible." },
              { q: "How do payments work?", a: "Payment is monthly, upfront. We accept bank transfer (Naira) and international transfer for clients outside Nigeria. An invoice is sent before each cycle." },
              { q: "Can I upgrade or downgrade later?", a: "Yes — anytime. As your business grows, your support should grow with it. Just give us a heads up before the next billing cycle." },
            ].map((item, i) => (
              <details key={i} className="group p-6 md:p-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                  <span className="font-serif text-lg md:text-xl text-primary">{item.q}</span>
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-gold transition group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">Final step</div>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl text-primary">
              Let's make your marketing strategic — not stressful.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Tell us a little about your business and we'll be in touch within one working day.
            </p>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-soft space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Your name" required>
                <input
                  required
                  type="text"
                  className="input-base"
                  placeholder="Jane Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={120}
                />
              </Field>
              <Field label="Email" required>
                <input
                  required
                  type="email"
                  className="input-base"
                  placeholder="jane@business.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  maxLength={255}
                />
              </Field>
            </div>
            <Field label="Business name">
              <input
                type="text"
                className="input-base"
                placeholder="Acme Co."
                value={contactForm.business}
                onChange={(e) => setContactForm((f) => ({ ...f, business: e.target.value }))}
                maxLength={200}
              />
            </Field>
            <Field label="What do you need help with?" required>
              <textarea
                required
                rows={4}
                className="input-base resize-none"
                placeholder="A few sentences about your business and where you'd like support…"
                value={contactForm.message}
                onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                maxLength={2000}
              />
            </Field>
            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-primary hover:bg-navy-deep text-primary-foreground rounded-full h-12">
              <Calendar className="mr-2 h-4 w-4" />
              {submitting ? "Sending…" : "Request my free consultation"}
            </Button>
            {open && (
              <p className="text-sm text-center text-gold mt-2">
                Thank you — we've received your request and will be in touch shortly.
              </p>
            )}
          </form>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="mailto:bookingswithgrace@gmail.com" className="flex items-center gap-2 hover:text-primary">
              <Mail className="h-4 w-4 text-gold" />
              <span>bookingswithgrace@gmail.com</span>
            </a>
            <a
              href="https://wa.link/z1qjtl"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { location: "contact_section" })}
              className="flex items-center gap-2 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 text-gold" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="leading-tight">
              <div className="font-serif text-primary">Done For You</div>
              <div className="font-script text-gold text-sm -mt-1">by Grace</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Marketing that grows your business
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Done For You by Grace. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        .input-base {
          width: 100%;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          color: var(--color-foreground);
          transition: all 0.2s;
          outline: none;
        }
        .input-base:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px oklch(0.74 0.09 50 / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-primary font-medium">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
