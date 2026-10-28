import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { StarterShell } from "@/components/starter-pack/shell";
import { confirmSubscription } from "@/lib/resource-leads.functions";

export const Route = createFileRoute("/confirm-subscription")({
  validateSearch: z.object({ t: z.string().max(64).optional() }),
  head: () => ({
    meta: [
      { title: "Confirm your email preferences | Done For You by Grace" },
      { name: "description", content: "Confirm the emails you asked to receive from Done For You by Grace." },
      { property: "og:title", content: "Confirm your email preferences | Done For You by Grace" },
      { property: "og:description", content: "Confirm the emails you asked to receive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirm,
});

function Confirm() {
  const { t } = Route.useSearch();
  const confirm = useServerFn(confirmSubscription);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function go() {
    if (!t) return;
    setState("busy");
    try {
      await confirm({ data: { token: t } });
      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <StarterShell>
      <section className="mx-auto max-w-xl px-5 py-24">
        <h1 className="font-serif text-4xl text-ink">Confirm your email preferences</h1>
        {!t ? (
          <p className="mt-4 text-charcoal">Please use the confirmation link from your email.</p>
        ) : state === "done" ? (
          <p role="status" className="mt-4 text-charcoal">Thank you, you are confirmed. You can unsubscribe from any email at any time.</p>
        ) : (
          <>
            <p className="mt-4 text-charcoal">Click below to confirm the emails you asked to receive from Done For You by Grace.</p>
            <button onClick={go} disabled={state === "busy"} className="mt-6 bg-ink px-6 py-3 text-sm text-ivory disabled:opacity-60">
              {state === "busy" ? "Confirming…" : "Yes, confirm"}
            </button>
            {state === "error" && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}
          </>
        )}
      </section>
    </StarterShell>
  );
}
