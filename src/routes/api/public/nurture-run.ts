import { createFileRoute } from "@tanstack/react-router";

// Sends the Day 2 / 4 / 7 nurture emails to CONSENTED contacts only.
// Disabled unless BOTH secrets are set:
//   NURTURE_SENDING_ENABLED = "true"
//   NURTURE_CRON_SECRET     = long random string, sent as "Authorization: Bearer <secret>"
// Trigger with an external scheduler (e.g. a daily cron) calling POST /api/public/nurture-run.
// Add ?dry=1 to preview who is due without sending.

const DAYS = [
  { day: 2 as const, col: "nurture_day2_sent_at" as const },
  { day: 4 as const, col: "nurture_day4_sent_at" as const },
  { day: 7 as const, col: "nurture_day7_sent_at" as const },
];

export const Route = createFileRoute("/api/public/nurture-run")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.NURTURE_CRON_SECRET;
        if (!secret) return Response.json({ error: "not_configured" }, { status: 503 });
        if (request.headers.get("authorization") !== `Bearer ${secret}`)
          return Response.json({ error: "unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const dry = url.searchParams.get("dry") === "1";
        const enabled = process.env.NURTURE_SENDING_ENABLED === "true";
        const site = process.env.SITE_URL || "https://bygracemarketing.com";

        const mail = await import("@/lib/resource-mail.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        if (!dry && (!enabled || !mail.mailProvider()))
          return Response.json({ error: "sending_disabled_or_no_provider" }, { status: 503 });

        const summary: Record<string, number> = {};
        for (const { day, col } of DAYS) {
          const cutoff = new Date(Date.now() - day * 86400_000).toISOString();
          const { data: due } = await supabaseAdmin
            .from("resource_leads")
            .select("id, email, name, unsubscribe_token")
            .eq("marketing_consent", true)
            .is("unsubscribed_at", null)
            .is(col, null)
            .not("delivered_at", "is", null)
            .lte("delivered_at", cutoff)
            .limit(50);
          let sent = 0;
          for (const lead of due ?? []) {
            if (dry) { sent++; continue; }
            const unsub = `${site}/unsubscribe?t=${lead.unsubscribe_token}`;
            const { subject, html } = mail.nurtureEmail(day, lead.name.split(" ")[0] || lead.name, unsub);
            const ok = await mail.sendMail({
              to: lead.email,
              subject,
              html,
              headers: { "List-Unsubscribe": `<${unsub}>` },
            });
            if (ok) {
              await supabaseAdmin.from("resource_leads").update({ [col]: new Date().toISOString() } as never).eq("id", lead.id);
              sent++;
            }
          }
          summary[`day${day}`] = sent;
        }
        return Response.json({ dry, summary });
      },
    },
  },
});
