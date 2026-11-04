// Best-effort copy of leads into Grace's private Google Sheet ("DFY LEADS").
// Never throws: the database row and email alerts remain the source of truth.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";
export const LEADS_SHEET_ID = "1-L-9ed9zSnD4yDELFcu85vHfXEqxmsURbZhy4Mklb1g";
export const LEADS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${LEADS_SHEET_ID}/edit`;
const RESOURCE_TAB = "'Resource Leads'";
const PRICING_TAB = "'Pricing Leads'";

function headers() {
  const lovable = process.env.LOVABLE_API_KEY;
  const sheets = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lovable || !sheets) return null;
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": sheets,
    "Content-Type": "application/json",
  };
}

async function call(path: string, init: RequestInit = {}) {
  const h = headers();
  if (!h) {
    console.warn("[leads-sheet] Google Sheets not configured");
    return null;
  }
  try {
    const res = await fetch(`${GATEWAY_URL}/spreadsheets/${LEADS_SHEET_ID}${path}`, { ...init, headers: h });
    if (!res.ok) {
      console.error(`[leads-sheet] request failed [${res.status}]: ${await res.text()}`);
      return null;
    }
    return (await res.json()) as Record<string, unknown>;
  } catch (e) {
    console.error("[leads-sheet] request error", e);
    return null;
  }
}

const yn = (b: boolean | null | undefined) => (b ? "Yes" : "No");
const now = () => new Date().toISOString().replace("T", " ").slice(0, 16);

async function append(tab: string, row: (string | number)[]) {
  await call(`/values/${tab}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({ values: [row] }),
  });
}

export async function appendResourceLead(l: {
  leadId: string;
  name: string;
  email: string;
  businessName?: string | null;
  businessType?: string | null;
  challenge?: string | null;
  workbookStatus: string;
  source?: string | null;
  marketingRequested: boolean;
  waitlistRequested: boolean;
}) {
  await append(RESOURCE_TAB, [
    now(),
    l.name,
    l.email,
    l.businessName || "",
    l.businessType || "",
    l.challenge || "",
    l.workbookStatus,
    l.source || "",
    yn(l.marketingRequested),
    "No", // consent is only confirmed via the emailed double opt-in link
    "",
    l.waitlistRequested ? "Requested" : "No",
    "No",
    l.leadId,
  ]);
}

/** Update consent columns (J–M) of an existing row, found by Lead ID in column N. */
export async function updateResourceConsent(
  leadId: string,
  u: { confirmed?: boolean; confirmedAt?: string; waitlist?: string; unsubscribed?: boolean },
) {
  const col = await call(`/values/${RESOURCE_TAB}!N:N`);
  const rows = (col?.values as string[][] | undefined) ?? [];
  const idx = rows.findIndex((r) => r[0] === leadId);
  if (idx < 1) return;
  const r = idx + 1;
  const data: { range: string; values: string[][] }[] = [];
  if (u.confirmed !== undefined)
    data.push({ range: `${RESOURCE_TAB}!J${r}:K${r}`, values: [[yn(u.confirmed), u.confirmedAt ?? ""]] });
  if (u.waitlist !== undefined) data.push({ range: `${RESOURCE_TAB}!L${r}`, values: [[u.waitlist]] });
  if (u.unsubscribed !== undefined) data.push({ range: `${RESOURCE_TAB}!M${r}`, values: [[yn(u.unsubscribed)]] });
  if (!data.length) return;
  await call(`/values:batchUpdate`, { method: "POST", body: JSON.stringify({ valueInputOption: "RAW", data }) });
}

export async function appendPricingLead(l: {
  name: string;
  email: string;
  business?: string | null;
  message?: string | null;
  source: string;
}) {
  await append(PRICING_TAB, [now(), l.name, l.email, l.business || "", l.message || "", l.source]);
}
