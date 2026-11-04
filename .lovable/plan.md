# Send every new lead to a Google Sheet

## Where your leads are now
Your leads are saved in your project's backend (Lovable Cloud). To see them in Lovable: click **Cloud**, then **Database**, then **Tables**, then open **resource_leads** (Starter Pack sign-ups) or **pricing_leads** (consultation and rate-card requests).

## What changes
- Every new lead also gets added as a row in a Google Sheet you own. The sheet has two tabs:
  - **Starter Pack**: date, name, email, business name, business type, challenge, marketing opt-in, waitlist, source.
  - **Consultations & Rate Cards**: date, name, email, business, message, source.
- Your backend copy and the email alerts to hello@ stay the same, so no lead is lost if Google is ever unavailable.
- The lead alert email will say "Saved to your Google Sheet" with a link, not the technical table name.
- Optional: copy your existing leads into the sheet once.

## Steps
1. A Google Sheets connect card appears. Sign in with the Google account that should own the sheet.
2. I create the sheet "DFY by Grace – Leads" with both tabs. Or you can paste a link to a sheet you already have.
3. I submit one Starter Pack test and one consultation test, check both rows appear in the sheet, then remove the test entries.
4. No publishing until you confirm.

## Technical details
- Link the Google Sheets connector. Store the spreadsheet ID as a secret (`LEADS_SHEET_ID`).
- New `src/lib/leads-sheet.server.ts` with `appendLeadRow(tab, values)`, which calls `values:append` through the gateway. It is best-effort: errors are logged and never block the form or the emails.
- Call it after the insert in `submitResourceLead` (`resource-leads.functions.ts`) and in `notifyLead` (`notify-lead.functions.ts`).
- Change the alert footer text in `resource-mail.server.ts`.
