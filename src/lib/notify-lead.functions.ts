import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const NOTIFY_TO = "bookingswithgrace@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const LeadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  business: z.string().max(200).nullable().optional(),
  source: z.string().max(60).optional(),
  message: z.string().max(2000).nullable().optional(),
});

function encodeRaw(to: string, subject: string, html: string): string {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");
  const b64 = Buffer.from(message, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const notifyLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
    if (!lovableKey) {
      console.error("Server config error: LOVABLE_API_KEY missing");
      throw new Error("Service temporarily unavailable");
    }
    if (!gmailKey) {
      console.error("Server config error: GOOGLE_MAIL_API_KEY missing");
      throw new Error("Service temporarily unavailable");
    }

    const emailLower = data.email.toLowerCase().trim();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { count: sameEmailCount } = await supabaseAdmin
      .from("pricing_leads")
      .select("id", { count: "exact", head: true })
      .eq("email", emailLower)
      .gte("created_at", tenMinutesAgo);

    // Threshold is >1 because the lead row is inserted before notifyLead runs,
    // so the just-saved submission itself counts as 1.
    if (sameEmailCount && sameEmailCount > 1) {
      console.warn("Rate limit hit for email:", emailLower);
      throw new Error("Please wait a few minutes before submitting again.");
    }

    const { count: globalCount } = await supabaseAdmin
      .from("pricing_leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", fiveMinutesAgo);

    if (globalCount && globalCount >= 10) {
      console.warn("Global rate limit hit. Count:", globalCount);
      throw new Error("Service temporarily unavailable");
    }

    const business = data.business?.trim() || "—";
    const source = data.source || "pricing";
    const message = data.message?.trim() || "";
    const isContact = source === "contact_form";
    const subject = isContact
      ? `New consultation request: ${data.name}`
      : `New rate-card lead: ${data.name}`;
    const heading = isContact ? "New consultation request" : "New rate-card unlock";
    const intro = isContact
      ? "Someone just requested a free consultation from your site."
      : "Someone just unlocked your DFY by Grace pricing.";
    const messageRow = message
      ? `<tr><td style="padding:8px 0; color:#64748b; vertical-align:top;">Message</td><td style="padding:8px 0; white-space:pre-wrap;">${escapeHtml(message)}</td></tr>`
      : "";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; padding: 24px; color: #0f1b3d;">
        <h2 style="margin:0 0 16px; color:#0f1b3d;">${heading}</h2>
        <p style="margin:0 0 20px; color:#475569;">${intro}</p>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:8px 0; color:#64748b; width:120px;">Name</td><td style="padding:8px 0; font-weight:600;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#c9a84c;">${escapeHtml(data.email)}</a></td></tr>
          <tr><td style="padding:8px 0; color:#64748b;">Business</td><td style="padding:8px 0;">${escapeHtml(business)}</td></tr>
          ${messageRow}
          <tr><td style="padding:8px 0; color:#64748b;">Source</td><td style="padding:8px 0;">${escapeHtml(source)}</td></tr>
          <tr><td style="padding:8px 0; color:#64748b;">Time</td><td style="padding:8px 0;">${new Date().toUTCString()}</td></tr>
        </table>
        <p style="margin:24px 0 0; font-size:12px; color:#94a3b8;">Sent automatically from your DFY by Grace landing page.</p>
      </div>
    `.trim();

    const raw = encodeRaw(NOTIFY_TO, subject, html);

    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmailKey,
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Gmail send failed:", res.status, text);
      throw new Error("Service temporarily unavailable");
    }

    // Auto-reply to the prospect (contact form only). Errors logged, not thrown.
    if (isContact) {
      try {
        const autoRaw = encodeRaw(
          data.email,
          "Thanks for reaching out — let's get your free consultation booked",
          buildAutoReplyHtml(data.name),
        );
        const replyRes = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": gmailKey,
          },
          body: JSON.stringify({ raw: autoRaw }),
        });
        if (!replyRes.ok) {
          const text = await replyRes.text().catch(() => "");
          console.error("Auto-reply send failed:", replyRes.status, text);
        }
      } catch (err) {
        console.error("Auto-reply error:", err);
      }
    }

    return { ok: true };
  });

const CALENDLY_URL = "https://calendly.com/grayson_/30mins";

function buildAutoReplyHtml(name: string): string {
  const firstName = escapeHtml(name.split(" ")[0] || name);
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0f1b3d; background: #ffffff;">
      <div style="text-align:center; padding-bottom: 24px; border-bottom: 1px solid #eef0f4;">
        <h1 style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; color:#0f1b3d; font-weight: 400;">Done For You by Grace</h1>
        <p style="margin: 6px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color:#c9a84c;">Marketing &middot; Strategy &middot; Support</p>
      </div>
      <h2 style="margin: 28px 0 12px; font-family: Georgia, serif; font-size: 22px; color:#0f1b3d; font-weight: 400;">Hi ${firstName},</h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color:#334155;">
        Thank you for reaching out &mdash; your consultation request has landed safely in my inbox, and I'm genuinely excited to learn more about your business.
      </p>
      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.65; color:#334155;">
        To save us both time, please pick a 30-minute slot that works for you using the link below. We'll talk through where your business is now, where you'd like it to go, and the smartest next step for your marketing.
      </p>
      <div style="text-align:center; margin: 32px 0;">
        <a href="${CALENDLY_URL}" style="display:inline-block; background:#0f1b3d; color:#ffffff; text-decoration:none; padding: 14px 32px; border-radius: 999px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
          Book my free 30-min consultation
        </a>
      </div>
      <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.65; color:#64748b;">
        Or copy &amp; paste this link into your browser:<br/>
        <a href="${CALENDLY_URL}" style="color:#c9a84c; word-break: break-all;">${CALENDLY_URL}</a>
      </p>
      <div style="margin: 32px 0 0; padding-top: 24px; border-top: 1px solid #eef0f4; font-size: 14px; line-height: 1.7; color:#475569;">
        <p style="margin: 0 0 6px;">In the meantime, if there's anything urgent, just reply to this email or message me on WhatsApp.</p>
        <p style="margin: 16px 0 4px; color:#0f1b3d;"><strong>Grace</strong></p>
        <p style="margin: 0; font-size: 13px; color:#94a3b8;">Founder, Done For You by Grace<br/>
          <a href="mailto:bookingswithgrace@gmail.com" style="color:#c9a84c; text-decoration:none;">bookingswithgrace@gmail.com</a> &middot;
          <a href="https://bygracemarketing.com" style="color:#c9a84c; text-decoration:none;">bygracemarketing.com</a>
        </p>
      </div>
    </div>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
