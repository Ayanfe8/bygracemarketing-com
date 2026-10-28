import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

// SECURITY MODEL
// - The browser only ever receives a short-lived, non-privileged receipt token tied to ONE request.
//   It can show that request's delivery status and nothing about the subscriber (no name, prefs).
// - Consent changes need a token that is only ever sent by email to the lead's own address:
//   confirm_token (double opt-in for marketing / waitlist) and unsubscribe_token.
// - Every form submission returns the same response shape, new or returning, to avoid enumeration.

export const BUSINESS_TYPES = [
  "SME / product brand",
  "Service business",
  "Founder / consultant",
  "NGO / purpose-led",
  "Other",
] as const;
export const CHALLENGES = [
  "Brand clarity",
  "Attracting leads",
  "Converting enquiries",
  "Customer retention",
  "Measurement",
  "Not sure",
] as const;

export type DeliveryState =
  | "sent"
  | "failed"
  | "assets_missing"
  | "not_configured"
  | "pending"
  | "recent";

function requestOrigin(): string {
  const req = getRequest();
  const url = new URL(req.url);
  const sandboxHost = url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
  return sandboxHost ? `https://${sandboxHost}` : url.origin;
}

const opt = (max: number) => z.string().trim().max(max).optional().nullable();

const SubmitSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  businessName: opt(200),
  businessType: z.enum(BUSINESS_TYPES).optional().nullable(),
  challenge: z.enum(CHALLENGES).optional().nullable(),
  marketingConsent: z.boolean(),
  waitlist: z.boolean(),
  website: z.string().max(200).optional(), // honeypot
  source: opt(100),
  utm_source: opt(100),
  utm_medium: opt(100),
  utm_campaign: opt(150),
  utm_term: opt(150),
  utm_content: opt(150),
});

const TokenSchema = z.object({ token: z.string().uuid() });

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

/** Sends the transactional delivery email and records the outcome on the lead. */
async function deliver(leadId: string, email: string, name: string, origin: string): Promise<DeliveryState> {
  const mail = await import("./resource-mail.server");
  const db = await admin();
  let status: DeliveryState;
  if (!(await mail.assetsAvailable(origin))) status = "assets_missing";
  else if (!mail.mailProvider()) status = "not_configured";
  else {
    const { subject, html } = mail.deliveryEmail(name.split(" ")[0] || name, origin);
    status = (await mail.sendMail({ to: email, subject, html })) ? "sent" : "failed";
  }
  const { data: cur } = await db.from("resource_leads").select("delivery_attempts").eq("id", leadId).single();
  const nowIso = new Date().toISOString();
  await db
    .from("resource_leads")
    .update({
      delivery_status: status,
      delivery_attempts: (cur?.delivery_attempts ?? 0) + (status === "sent" || status === "failed" ? 1 : 0),
      ...(status === "sent" ? { delivered_at: nowIso } : {}),
      updated_at: nowIso,
    })
    .eq("id", leadId);
  console.log(`[starter-pack] delivery ${status} for ${mail.maskEmail(email)}`);
  return status;
}

/** Sends a double opt-in email if anything is pending. Throttled to one per 10 minutes. */
async function sendConfirmIfPending(leadId: string, origin: string) {
  const mail = await import("./resource-mail.server");
  const db = await admin();
  const { data: lead } = await db
    .from("resource_leads")
    .select("email, name, pending_marketing, pending_waitlist, confirm_sent_at")
    .eq("id", leadId)
    .single();
  if (!lead || (!lead.pending_marketing && !lead.pending_waitlist)) return;
  if (lead.confirm_sent_at && Date.now() - new Date(lead.confirm_sent_at).getTime() < 10 * 60_000) return;
  if (!mail.mailProvider()) return;
  const token = crypto.randomUUID();
  await db
    .from("resource_leads")
    .update({ confirm_token: token, confirm_sent_at: new Date().toISOString() })
    .eq("id", leadId);
  const items = [
    ...(lead.pending_marketing ? ["marketing insights and occasional offers"] : []),
    ...(lead.pending_waitlist ? ["early access to The Visibility-to-Revenue Playbook"] : []),
  ];
  const { subject, html } = mail.confirmEmail(
    lead.name.split(" ")[0] || lead.name,
    `${origin}/confirm-subscription?t=${token}`,
    items,
  );
  await mail.sendMail({ to: lead.email, subject, html });
}

async function newReceipt(leadId: string, status: DeliveryState, consent: boolean, waitlist: boolean) {
  const db = await admin();
  const { data } = await db
    .from("resource_receipts")
    .insert({ lead_id: leadId, delivery_status: status, consent_requested: consent, waitlist_requested: waitlist })
    .select("token")
    .single();
  return data?.token ?? null;
}

export const submitResourceLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website && data.website.trim() !== "") return { receipt: null };

    const db = await admin();
    const origin = requestOrigin();
    const email = data.email.toLowerCase();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    const { count: recent } = await db
      .from("resource_leads")
      .select("id", { count: "exact", head: true })
      .gte("last_requested_at", new Date(now - 5 * 60_000).toISOString());
    if ((recent ?? 0) >= 20) throw new Error("We are receiving a lot of requests. Please try again in a few minutes.");

    const { data: existing } = await db
      .from("resource_leads")
      .select("id, name, business_name, business_type, challenge, marketing_consent, waitlist_playbook, request_count, last_requested_at, delivery_status, delivered_at")
      .eq("email", email)
      .maybeSingle();

    let leadId: string;
    let status: DeliveryState;

    if (existing) {
      leadId = existing.id;
      const throttled = now - new Date(existing.last_requested_at).getTime() < 2 * 60_000;
      // Returning leads: never overwrite stored details from an unverified submitter,
      // never change consent directly. Wanted opt-ins become "pending" and need email confirmation.
      await db
        .from("resource_leads")
        .update({
          business_name: existing.business_name ?? (data.businessName || null),
          business_type: existing.business_type ?? (data.businessType || null),
          challenge: existing.challenge ?? (data.challenge || null),
          ...(data.marketingConsent && !existing.marketing_consent ? { pending_marketing: true } : {}),
          ...(data.waitlist && !existing.waitlist_playbook ? { pending_waitlist: true } : {}),
          request_count: existing.request_count + 1,
          last_requested_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", leadId);
      const sentRecently =
        existing.delivery_status === "sent" &&
        existing.delivered_at &&
        now - new Date(existing.delivered_at).getTime() < 24 * 3600_000;
      if (throttled || sentRecently) status = "recent";
      else status = await deliver(leadId, email, existing.name, origin);
    } else {
      const { data: inserted, error } = await db
        .from("resource_leads")
        .insert({
          email,
          name: data.name,
          business_name: data.businessName || null,
          business_type: data.businessType || null,
          challenge: data.challenge || null,
          source: data.source || "starter_pack_page",
          utm_source: data.utm_source || null,
          utm_medium: data.utm_medium || null,
          utm_campaign: data.utm_campaign || null,
          utm_term: data.utm_term || null,
          utm_content: data.utm_content || null,
          marketing_consent: false,
          waitlist_playbook: false,
          pending_marketing: data.marketingConsent,
          pending_waitlist: data.waitlist,
        })
        .select("id")
        .single();
      if (error || !inserted) {
        console.error("[starter-pack] insert failed", error?.code);
        throw new Error("We could not save your request. Please try again.");
      }
      leadId = inserted.id;
      status = await deliver(leadId, email, data.name, origin);
      const mail = await import("./resource-mail.server");
      if (mail.mailProvider()) {
        await mail.sendMail({
          to: mail.TEAM_INBOX,
          ...mail.teamNotifyEmail({
            name: data.name,
            business: data.businessName,
            businessType: data.businessType,
            challenge: data.challenge,
            marketing: data.marketingConsent,
            waitlist: data.waitlist,
            source: data.utm_source || data.source,
          }),
        });
      }
    }

    await sendConfirmIfPending(leadId, origin);
    const receipt = await newReceipt(leadId, status, data.marketingConsent, data.waitlist);
    return { receipt };
  });

async function loadReceipt(token: string) {
  const db = await admin();
  const { data } = await db
    .from("resource_receipts")
    .select("id, lead_id, delivery_status, consent_requested, waitlist_requested, retry_count, updated_at, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
  return data;
}

export const getStarterPackStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ token: z.string().max(64).optional() }).parse(input))
  .handler(async ({ data }) => {
    const mail = await import("./resource-mail.server");
    const assets = await mail.assetsAvailable(requestOrigin());
    const files = assets ? mail.RESOURCE_FILES.map((f) => ({ title: f.title, path: f.path })) : [];
    const parsed = z.string().uuid().safeParse(data.token);
    const r = parsed.success ? await loadReceipt(parsed.data) : null;
    if (!r) return { found: false, assets, files, delivery: null, consentRequested: false, waitlistRequested: false };
    return {
      found: true,
      assets,
      files,
      delivery: r.delivery_status as DeliveryState,
      consentRequested: r.consent_requested,
      waitlistRequested: r.waitlist_requested,
    };
  });

export const retryStarterPackDelivery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const r = await loadReceipt(data.token);
    if (!r) throw new Error("This page has expired. Please request the Starter Pack again.");
    if (r.delivery_status === "sent") return { delivery: "sent" as DeliveryState };
    if (r.retry_count >= 3) throw new Error("Too many attempts. Please contact us instead.");
    if (Date.now() - new Date(r.updated_at).getTime() < 30_000) throw new Error("Please wait a moment before trying again.");
    const db = await admin();
    const { data: lead } = await db.from("resource_leads").select("email, name").eq("id", r.lead_id).single();
    if (!lead) throw new Error("Request not found.");
    const delivery = await deliver(r.lead_id, lead.email, lead.name, requestOrigin());
    await db
      .from("resource_receipts")
      .update({ delivery_status: delivery, retry_count: r.retry_count + 1, updated_at: new Date().toISOString() })
      .eq("id", r.id);
    return { delivery };
  });

/** Receipt holders can only REQUEST waitlist access; it becomes active after email confirmation. */
export const requestPlaybookWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const r = await loadReceipt(data.token);
    if (!r) throw new Error("This page has expired. Please request the Starter Pack again.");
    const db = await admin();
    const { data: lead } = await db.from("resource_leads").select("waitlist_playbook").eq("id", r.lead_id).single();
    if (lead && !lead.waitlist_playbook) {
      await db.from("resource_leads").update({ pending_waitlist: true }).eq("id", r.lead_id);
      await sendConfirmIfPending(r.lead_id, requestOrigin());
    }
    await db.from("resource_receipts").update({ waitlist_requested: true }).eq("id", r.id);
    return { ok: true };
  });

/** Double opt-in: only reachable via the link emailed to the lead's own address. */
export const confirmSubscription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: lead } = await db
      .from("resource_leads")
      .select("id, pending_marketing, pending_waitlist, confirm_sent_at")
      .eq("confirm_token", data.token)
      .maybeSingle();
    if (!lead || !lead.confirm_sent_at || Date.now() - new Date(lead.confirm_sent_at).getTime() > 7 * 86400_000)
      throw new Error("This confirmation link is not valid or has expired.");
    const now = new Date().toISOString();
    await db
      .from("resource_leads")
      .update({
        ...(lead.pending_marketing ? { marketing_consent: true, marketing_consent_at: now, unsubscribed_at: null } : {}),
        ...(lead.pending_waitlist ? { waitlist_playbook: true, waitlist_at: now } : {}),
        pending_marketing: false,
        pending_waitlist: false,
        confirm_token: null,
        updated_at: now,
      })
      .eq("id", lead.id);
    return { ok: true };
  });

/** Unsubscribe: only via unsubscribe_token, which is only ever placed in emails to the lead. */
export const unsubscribeMarketing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const now = new Date().toISOString();
    const { data: rows, error } = await db
      .from("resource_leads")
      .update({
        marketing_consent: false,
        waitlist_playbook: false,
        pending_marketing: false,
        pending_waitlist: false,
        confirm_token: null,
        unsubscribed_at: now,
        updated_at: now,
      })
      .eq("unsubscribe_token", data.token)
      .select("id");
    if (error || !rows?.length) throw new Error("This unsubscribe link is not valid.");
    return { ok: true };
  });
