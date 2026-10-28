import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

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

export type DeliveryState = "sent" | "failed" | "assets_missing" | "not_configured" | "pending";

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

/** Core delivery: sends the transactional email and records the outcome. */
async function deliver(leadId: string, email: string, name: string, origin: string) {
  const mail = await import("./resource-mail.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let status: DeliveryState;
  if (!(await mail.assetsAvailable(origin))) status = "assets_missing";
  else if (!mail.mailProvider()) status = "not_configured";
  else {
    const { subject, html } = mail.deliveryEmail(name.split(" ")[0] || name, origin);
    status = (await mail.sendMail({ to: email, subject, html })) ? "sent" : "failed";
  }
  const { data: cur } = await supabaseAdmin
    .from("resource_leads")
    .select("delivery_attempts")
    .eq("id", leadId)
    .single();
  await supabaseAdmin
    .from("resource_leads")
    .update({
      delivery_status: status,
      delivery_attempts: (cur?.delivery_attempts ?? 0) + (status === "sent" || status === "failed" ? 1 : 0),
      ...(status === "sent" ? { delivered_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);
  console.log(`[starter-pack] delivery ${status} for ${mail.maskEmail(email)}`);
  return status;
}

export const submitResourceLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitSchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot: silently drop bots without storing anything.
    if (data.website && data.website.trim() !== "") return { token: null, delivery: "pending" as DeliveryState };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const mail = await import("./resource-mail.server");
    const email = data.email.toLowerCase();
    const now = new Date();
    const nowIso = now.toISOString();

    const { count: recent } = await supabaseAdmin
      .from("resource_leads")
      .select("id", { count: "exact", head: true })
      .gte("last_requested_at", new Date(now.getTime() - 5 * 60_000).toISOString());
    if ((recent ?? 0) >= 20) throw new Error("We are receiving a lot of requests. Please try again in a few minutes.");

    const { data: existing } = await supabaseAdmin
      .from("resource_leads")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    const utm = {
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_term: data.utm_term || null,
      utm_content: data.utm_content || null,
    };

    if (existing) {
      // Per-email throttle: repeat within 2 minutes returns the existing state without resending.
      const lastMs = new Date(existing.last_requested_at).getTime();
      if (now.getTime() - lastMs < 2 * 60_000) {
        return { token: existing.access_token, delivery: existing.delivery_status as DeliveryState };
      }
      await supabaseAdmin
        .from("resource_leads")
        .update({
          name: data.name,
          business_name: data.businessName || existing.business_name,
          business_type: data.businessType || existing.business_type,
          challenge: data.challenge || existing.challenge,
          // Consent is only ever granted by an explicit tick; an unticked box never revokes it here (use unsubscribe).
          ...(data.marketingConsent
            ? { marketing_consent: true, marketing_consent_at: nowIso, unsubscribed_at: null }
            : {}),
          ...(data.waitlist && !existing.waitlist_playbook ? { waitlist_playbook: true, waitlist_at: nowIso } : {}),
          request_count: existing.request_count + 1,
          last_requested_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", existing.id);
      // Avoid double-sending: if delivered in the last 24h, do not send again.
      if (
        existing.delivery_status === "sent" &&
        existing.delivered_at &&
        now.getTime() - new Date(existing.delivered_at).getTime() < 24 * 3600_000
      ) {
        return { token: existing.access_token, delivery: "sent" as DeliveryState };
      }
      const delivery = await deliver(existing.id, email, data.name, requestOrigin());
      return { token: existing.access_token, delivery };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("resource_leads")
      .insert({
        email,
        name: data.name,
        business_name: data.businessName || null,
        business_type: data.businessType || null,
        challenge: data.challenge || null,
        source: data.source || "starter_pack_page",
        ...utm,
        marketing_consent: data.marketingConsent,
        marketing_consent_at: data.marketingConsent ? nowIso : null,
        waitlist_playbook: data.waitlist,
        waitlist_at: data.waitlist ? nowIso : null,
      })
      .select("id, access_token")
      .single();
    if (error || !inserted) {
      console.error("[starter-pack] insert failed", error?.code);
      throw new Error("We could not save your request. Please try again.");
    }

    const delivery = await deliver(inserted.id, email, data.name, requestOrigin());

    // Best-effort internal notification (no contact email in the body).
    if (mail.mailProvider()) {
      const n = mail.teamNotifyEmail({
        name: data.name,
        business: data.businessName,
        businessType: data.businessType,
        challenge: data.challenge,
        marketing: data.marketingConsent,
        waitlist: data.waitlist,
        source: data.utm_source || data.source,
      });
      await mail.sendMail({ to: mail.TEAM_INBOX, ...n });
    }
    return { token: inserted.access_token, delivery };
  });

export const getStarterPackStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ token: z.string().max(64).optional() }).parse(input))
  .handler(async ({ data }) => {
    const mail = await import("./resource-mail.server");
    const origin = requestOrigin();
    const assets = await mail.assetsAvailable(origin);
    const files = mail.RESOURCE_FILES.map((f) => ({ title: f.title, path: f.path }));
    const parsed = z.string().uuid().safeParse(data.token);
    if (!parsed.success) return { found: false, assets, files, firstName: null, delivery: null, waitlist: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lead } = await supabaseAdmin
      .from("resource_leads")
      .select("name, delivery_status, waitlist_playbook")
      .eq("access_token", parsed.data)
      .maybeSingle();
    if (!lead) return { found: false, assets, files, firstName: null, delivery: null, waitlist: false };
    return {
      found: true,
      assets,
      files: assets ? files : [],
      firstName: lead.name.split(" ")[0] ?? null,
      delivery: lead.delivery_status as DeliveryState,
      waitlist: lead.waitlist_playbook,
    };
  });

export const retryStarterPackDelivery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lead } = await supabaseAdmin
      .from("resource_leads")
      .select("id, email, name, delivery_status, delivery_attempts, updated_at")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!lead) throw new Error("Request not found.");
    if (lead.delivery_status === "sent") return { delivery: "sent" as DeliveryState };
    if (lead.delivery_attempts >= 5) throw new Error("Too many attempts. Please contact us instead.");
    if (Date.now() - new Date(lead.updated_at).getTime() < 30_000)
      throw new Error("Please wait a moment before trying again.");
    const delivery = await deliver(lead.id, lead.email, lead.name, requestOrigin());
    return { delivery };
  });

export const joinPlaybookWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("resource_leads")
      .update({ waitlist_playbook: true, waitlist_at: new Date().toISOString() })
      .eq("access_token", data.token)
      .select("id");
    if (error || !rows?.length) throw new Error("We could not update your request.");
    return { ok: true };
  });

export const unsubscribeMarketing = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("resource_leads")
      .update({ marketing_consent: false, waitlist_playbook: false, unsubscribed_at: now, updated_at: now })
      .eq("access_token", data.token)
      .select("id");
    if (error || !rows?.length) throw new Error("This unsubscribe link is not valid.");
    return { ok: true };
  });
