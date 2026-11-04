# Make the lead alert email say where your leads are

## Where your leads are now
Your leads are saved in your project's backend (Lovable Cloud). To see them:
1. Open this project in Lovable.
2. Click **Cloud** at the top of the editor (or the "View Backend" button below).
3. Go to **Database**, then **Tables**.
4. Open **resource_leads** for Starter Pack sign-ups, or **pricing_leads** for consultation and rate-card requests.

You can only see them while signed in to Lovable. The public website can't show them.

## Change
- In the Starter Pack lead alert email, replace "Contact details are stored in the resource_leads table in your backend" with plain steps: "Saved to your leads list. To view all leads: open your project in Lovable, then Cloud, then Database, then resource_leads."
- No other copy, design or email changes. No publishing.

## Technical details
- Edit the alert footer text in `src/lib/resource-mail.server.ts` only.
