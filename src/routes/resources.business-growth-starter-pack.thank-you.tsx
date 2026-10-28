import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { StarterShell } from "@/components/starter-pack/shell";
import {
  getStarterPackStatus,
  retryStarterPackDelivery,
  requestPlaybookWaitlist,
} from "@/lib/resource-leads.functions";

export const Route = createFileRoute("/resources/business-growth-starter-pack/thank-you")({
  validateSearch: z.object({ t: z.string().max(64).optional() }),
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: ({ deps }) => getStarterPackStatus({ data: { token: deps.t } }),
  head: () => ({
    meta: [
      { title: "Your Starter Pack | Done For You by Grace" },
      { name: "description", content: "Thank you for requesting the Business Growth Starter Pack from Done For You by Grace." },
      { property: "og:title", content: "Your Starter Pack | Done For You by Grace" },
      { property: "og:description", content: "Your next stage of growth starts with clarity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const s = Route.useLoaderData();
  const { t } = Route.useSearch();
  const router = useRouter();
  const retry = useServerFn(retryStarterPackDelivery);
  const join = useServerFn(requestPlaybookWaitlist);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [waitBusy, setWaitBusy] = useState(false);
  const [joined, setJoined] = useState(s.waitlistRequested);

  if (!s.found || !t) {
    return (
      <StarterShell>
        <section className="mx-auto max-w-2xl px-5 py-24">
          <h1 className="font-serif text-4xl text-ink">Request the Starter Pack first</h1>
          <p className="mt-4 text-charcoal">This page has expired or no request is linked to it. Your workbooks are sent by email; if you need them again, request the pack below.</p>
          <Link to="/resources/business-growth-starter-pack" className="mt-8 inline-block bg-ink px-6 py-3 text-sm text-ivory">
            Get the free Starter Pack
          </Link>
        </section>
      </StarterShell>
    );
  }

  const status = s.delivery;
  const statusText: Record<string, string> = {
    sent: "We have emailed both workbooks to the address you entered. If you cannot see it in a few minutes, check your promotions or spam folder.",
    recent: "Your request is received. If this address requested the pack recently, the workbooks are already in that inbox — please check your promotions or spam folder.",
    failed: "Your request is saved, but we could not send the email just now.",
    not_configured: "Your request is saved. Email delivery is not switched on yet, so no email has been sent.",
    assets_missing: "Your request is saved. The workbooks are being finalised, so no email has been sent yet.",
    pending: "Your request is saved and delivery has not completed yet.",
  };

  async function onRetry() {
    setBusy(true);
    setMsg(null);
    try {
      await retry({ data: { token: t! } });
      await router.invalidate();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not retry.");
    } finally {
      setBusy(false);
    }
  }

  async function onJoin() {
    setWaitBusy(true);
    try {
      await join({ data: { token: t! } });
      setJoined(true);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not update.");
    } finally {
      setWaitBusy(false);
    }
  }

  return (
    <StarterShell>
      <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-charcoal">Business Growth Starter Pack</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          Your next stage of growth starts with clarity.
        </h1>

        <div role="status" className="mt-8 border-l-2 border-ink pl-4 text-charcoal">
          <p>{statusText[status ?? "pending"]}</p>
          {status === "failed" && (
            <button onClick={onRetry} disabled={busy}
              className="mt-3 inline-flex items-center gap-2 border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-ivory disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Try sending again
            </button>
          )}
          {s.consentRequested && (
            <p className="mt-3 text-sm">To start receiving insights from Grace, please confirm using the link in the separate confirmation email.</p>
          )}
          {status !== "sent" && status !== "recent" && (
            <p className="mt-3 text-sm">
              Need it sooner? Email <a className="underline" href="mailto:bookingswithgrace@gmail.com">bookingswithgrace@gmail.com</a>.
            </p>
          )}
          {msg && <p role="alert" className="mt-2 text-sm text-destructive">{msg}</p>}
        </div>

        <div className="mt-12">
          <h2 className="font-serif text-2xl text-ink">Your workbooks</h2>
          {s.assets ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {s.files.map((f) => (
                <a key={f.path} href={f.path} download
                  className="bg-ink px-5 py-4 text-sm text-ivory hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  Download: {f.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 border border-dashed border-charcoal p-4 text-sm text-charcoal">
              Download files not yet uploaded. The workbook PDFs will appear here once they are added to the site.
            </p>
          )}
        </div>

        <div className="mt-12">
          <h2 className="font-serif text-2xl text-ink">Next steps</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-charcoal">
            <li>Set aside 30 minutes and complete the 7-Point Business Growth Audit.</li>
            <li>Note your lowest-scoring areas out of 42.</li>
            <li>Use the Readiness Checklist and 30-day planner to choose one focus.</li>
          </ol>
          <a href="/#contact" className="mt-6 inline-block border border-ink px-6 py-3 text-sm text-ink hover:bg-ink hover:text-ivory">
            Request a free consultation
          </a>
        </div>

        <aside className="mt-16 border-t border-stone pt-8">
          <h2 className="font-serif text-xl text-ink">The Visibility-to-Revenue Playbook is coming</h2>
          <p className="mt-2 text-sm text-charcoal">A next-step guide for turning attention into enquiries. Want a note when it is ready?</p>
          {joined ? (
            <p className="mt-3 text-sm text-ink">Thank you. Please confirm using the link we send to your email to join the early-access list.</p>
          ) : (
            <button onClick={onJoin} disabled={waitBusy}
              className="mt-3 inline-flex items-center gap-2 text-sm text-ink underline underline-offset-4 disabled:opacity-60">
              {waitBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Yes, tell me when it is available
            </button>
          )}
        </aside>
      </section>
    </StarterShell>
  );
}
