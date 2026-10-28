import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { StarterShell } from "@/components/starter-pack/shell";
import { unsubscribeMarketing } from "@/lib/resource-leads.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: z.object({ t: z.string().max(64).optional() }),
  head: () => ({
    meta: [
      { title: "Unsubscribe | Done For You by Grace" },
      { name: "description", content: "Stop receiving marketing emails from Done For You by Grace." },
      { property: "og:title", content: "Unsubscribe | Done For You by Grace" },
      { property: "og:description", content: "Manage your email preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Unsubscribe,
});

function Unsubscribe() {
  const { t } = Route.useSearch();
  const unsub = useServerFn(unsubscribeMarketing);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function go() {
    if (!t) return;
    setState("busy");
    try {
      await unsub({ data: { token: t } });
      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <StarterShell>
      <section className="mx-auto max-w-xl px-5 py-24">
        <h1 className="font-serif text-4xl text-ink">Email preferences</h1>
        {!t ? (
          <p className="mt-4 text-charcoal">Please use the unsubscribe link from one of our emails, or email bookingswithgrace@gmail.com.</p>
        ) : state === "done" ? (
          <p role="status" className="mt-4 text-charcoal">You have been unsubscribed from marketing and early-access emails.</p>
        ) : (
          <>
            <p className="mt-4 text-charcoal">Click below to stop receiving marketing and early-access emails from Done For You by Grace.</p>
            <button onClick={go} disabled={state === "busy"} className="mt-6 bg-ink px-6 py-3 text-sm text-ivory disabled:opacity-60">
              {state === "busy" ? "Updating…" : "Unsubscribe"}
            </button>
            {state === "error" && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}
          </>
        )}
      </section>
    </StarterShell>
  );
}
