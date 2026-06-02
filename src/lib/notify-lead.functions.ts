import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  // Base64url encode (handle unicode safely)
  const b64 = Buffer.from(message, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const notifyLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!gmailKey) throw new Error("GOOGLE_MAIL_API_KEY is not configured");

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
      throw new Error(`Gmail send failed (${res.status})`);
    }

    return { ok: true };
  });

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
