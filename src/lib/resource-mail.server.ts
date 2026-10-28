// Server-only mail helpers for the Business Growth Starter Pack funnel.
// Transactional mail (resource delivery) and marketing mail (nurture) are
// built separately; marketing templates always include an unsubscribe link.

export const RESOURCE_FILES = [
  {
    key: "audit",
    title: "The 7-Point Business Growth Audit",
    path: "/downloads/DFY_7_Point_Business_Growth_Audit_Final.pdf",
  },
  {
    key: "checklist",
    title: "The Founder\u2019s Growth Readiness Checklist",
    path: "/downloads/DFY_Founders_Growth_Readiness_Checklist_Final.pdf",
  },
] as const;

export const TEAM_INBOX = "bookingswithgrace@gmail.com";
const GMAIL_GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const RESEND_GATEWAY = "https://connector-gateway.lovable.dev/resend";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const b64 = (s: string) =>
  btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(""));
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

export function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  return `${(u ?? "").slice(0, 1)}***@${d ?? "?"}`;
}

/** Which provider can send right now (no secrets returned). */
export function mailProvider(): "gmail" | "resend" | null {
  if (process.env.LOVABLE_API_KEY && process.env.GOOGLE_MAIL_API_KEY) return "gmail";
  if (process.env.LOVABLE_API_KEY && process.env.RESEND_API_KEY && process.env.RESEND_FROM)
    return "resend";
  return null;
}

/** Sends an HTML email. Returns true only when the provider accepted it. */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}): Promise<boolean> {
  const provider = mailProvider();
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!provider || !lovableKey) {
    console.error("[mail] no provider configured");
    return false;
  }
  try {
    if (provider === "gmail") {
      const extra = Object.entries(opts.headers ?? {}).map(([k, v]) => `${k}: ${v}`);
      const msg = [
        `To: ${opts.to}`,
        `Subject: ${header(opts.subject)}`,
        ...extra,
        "MIME-Version: 1.0",
        'Content-Type: text/html; charset="UTF-8"',
        "",
        opts.html,
      ].join("\r\n");
      const raw = b64(msg).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const res = await fetch(`${GMAIL_GATEWAY}/users/me/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": process.env.GOOGLE_MAIL_API_KEY!,
        },
        body: JSON.stringify({ raw }),
      });
      if (!res.ok) {
        console.error("[mail] gmail failed", res.status, (await res.text()).slice(0, 300));
        return false;
      }
      return true;
    }
    const res = await fetch(`${RESEND_GATEWAY}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": process.env.RESEND_API_KEY!,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        headers: opts.headers,
      }),
    });
    if (!res.ok) {
      console.error("[mail] resend failed", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] send error", err instanceof Error ? err.message : "unknown");
    return false;
  }
}

/** Checks the two PDFs are really served (not an HTML fallback). */
export async function assetsAvailable(origin: string): Promise<boolean> {
  try {
    const results = await Promise.all(
      RESOURCE_FILES.map(async (f) => {
        const res = await fetch(`${origin}${f.path}`, { method: "HEAD" });
        const type = res.headers.get("content-type") ?? "";
        return res.ok && type.includes("pdf");
      }),
    );
    return results.every(Boolean);
  } catch {
    return false;
  }
}

const shell = (inner: string, footer: string) => `
<div style="background:#F2F0EB;padding:32px 12px;">
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;padding:36px 28px;color:#18283D;border:1px solid #D4D3CB;">
    <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:18px;color:#18283D;">Done For You by Grace</p>
    ${inner}
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #D4D3CB;font-size:12px;line-height:1.6;color:#525C65;">${footer}</div>
  </div>
</div>`.trim();

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:block;background:#18283D;color:#F2F0EB;text-decoration:none;padding:14px 20px;margin:0 0 10px;font-size:15px;text-align:center;">${escapeHtml(label)}</a>`;

export function deliveryEmail(firstName: string, origin: string) {
  const name = escapeHtml(firstName);
  const inner = `
    <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:24px;">Hi ${name},</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#525C65;">Thank you for requesting the Business Growth Starter Pack. Here are your two workbooks.</p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#525C65;">Start with the audit. Answer honestly, score yourself out of 42, then use the checklist to plan your next 30 days around the one or two areas that need the most attention.</p>
    ${RESOURCE_FILES.map((f) => button(`${origin}${f.path}`, `Download: ${f.title}`)).join("")}
    <p style="margin:22px 0 0;font-size:15px;line-height:1.65;color:#525C65;">If you would like a second pair of eyes on your results, you can request a free consultation at <a href="https://bygracemarketing.com/#contact" style="color:#18283D;">bygracemarketing.com</a>.</p>
    <p style="margin:22px 0 0;font-size:15px;color:#18283D;">Warmly,<br/>Grace</p>`;
  return {
    subject: `Your Business Growth Starter Pack is here, ${firstName}`,
    html: shell(
      inner,
      `You are receiving this because you requested the free Starter Pack at bygracemarketing.com. This is a one-off delivery email, not a marketing subscription.`,
    ),
  };
}

export function teamNotifyEmail(lead: {
  name: string;
  business?: string | null;
  businessType?: string | null;
  challenge?: string | null;
  marketing: boolean;
  waitlist: boolean;
  source?: string | null;
}) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#525C65;">${k}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`;
  return {
    subject: `New Starter Pack request: ${lead.name}`,
    html: shell(
      `<h2 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;">New Starter Pack request</h2>
       <table style="font-size:14px;border-collapse:collapse;">
        ${row("Name", lead.name)}
        ${row("Business", lead.business || "—")}
        ${row("Type", lead.businessType || "—")}
        ${row("Challenge", lead.challenge || "—")}
        ${row("Marketing opt-in", lead.marketing ? "Yes" : "No")}
        ${row("Playbook waitlist", lead.waitlist ? "Yes" : "No")}
        ${row("Source", lead.source || "direct")}
       </table>
       <p style="font-size:13px;color:#525C65;">Contact details are stored in the resource_leads table in your backend.</p>`,
      "Internal notification from bygracemarketing.com",
    ),
  };
}

// ---- Marketing nurture (consented contacts only) ----

export type NurtureDay = 2 | 4 | 7;

export function nurtureEmail(day: NurtureDay, firstName: string, unsubscribeUrl: string) {
  const name = escapeHtml(firstName);
  const p = (t: string) =>
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#525C65;">${t}</p>`;
  const content: Record<NurtureDay, { subject: string; body: string }> = {
    2: {
      subject: "A clearer offer before a louder campaign",
      body:
        p(`Hi ${name}, before spending more on visibility, it is worth checking whether your offer is easy to understand in one read.`) +
        p(`<strong>A 10-minute positioning fix:</strong> write one sentence that completes this: “I help [specific customer] get [specific outcome] without [main frustration].” Then read your homepage or bio and ask whether a stranger would arrive at the same sentence.`) +
        p(`If not, update the first line people see so it says that sentence plainly. Small, but it often makes every later campaign easier.`),
    },
    4: {
      subject: "The enquiry that slips away",
      body:
        p(`Hi ${name}, many enquiries are not lost to competitors. They are lost to slow or inconsistent follow-up.`) +
        p(`<strong>A one-step follow-up system:</strong> create a single saved reply for new enquiries that thanks them, asks one qualifying question, and offers a clear next step. Commit to sending it within the same working day, every time.`) +
        p(`Keep a simple list of anyone who has not replied after three days and send one short, friendly nudge.`),
    },
    7: {
      subject: "From the audit to your next 30 days",
      body:
        p(`Hi ${name}, by now you may have scored your audit. The most useful next step is to choose just one priority area, the lowest-scoring section that most affects revenue, and give it your next 30 days.`) +
        p(`Use the 30-day planner in the checklist to break it into weekly actions.`) +
        p(`If you would like help, you can <a href="https://bygracemarketing.com/#contact" style="color:#18283D;">request a free DFY consultation</a>. The Visibility-to-Revenue Playbook is also in development, and subscribers will hear when it is ready.`),
    },
  };
  const c = content[day];
  return {
    subject: c.subject,
    html: shell(
      c.body + `<p style="margin:18px 0 0;font-size:15px;color:#18283D;">Grace</p>`,
      `You are receiving this because you opted in to marketing emails from Done For You by Grace. <a href="${unsubscribeUrl}" style="color:#18283D;">Unsubscribe</a> at any time.`,
    ),
  };
}
