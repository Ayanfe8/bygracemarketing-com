# Send and receive all site email through hello@bygracemarketing.com

## What changes for you
- Workbook emails, consultation auto-replies, confirmation emails and later nurture emails will come **from** "Grace – Done For You by Grace <hello@bygracemarketing.com>". Replies go to that inbox too.
- New lead alerts (Starter Pack, rate-card unlocks, consultation form) go **to** hello@bygracemarketing.com instead of the Gmail address.
- Your current mail provider for hello@ stays as is. Nothing you already receive there is affected.

## Why not sign in to the mailbox directly
Your site can't sign in to a non-Google mailbox to send. Instead, a sending service (Resend) gets permission to send on behalf of bygracemarketing.com. It's free for your volume and also lets the nurture emails go out properly.

## Steps
1. **Connect Resend** (a connect card will appear; you create a free Resend account inside it).
2. **Verify your domain in Resend**: Resend shows 3–4 DNS records (TXT/MX on a `send` subdomain). You add them at the same DNS manager you used before. Keep the existing `185.158.133.1` record, the Lovable TXT records and your current mail (MX) records untouched.
3. Once Resend shows "Verified", I switch the site over and send test emails to hello@ and to a test address, then check the workbook links and the consultation Calendly button.
4. Gmail stays as an automatic backup sender only if Resend fails.

## Technical details
- `resource-mail.server.ts`: prefer Resend over Gmail in `mailProvider()`; add `Reply-To: hello@bygracemarketing.com`; `TEAM_INBOX` becomes `hello@bygracemarketing.com`.
- Secret `RESEND_FROM = "Grace – Done For You by Grace <hello@bygracemarketing.com>"`.
- `notify-lead.functions.ts` (rate cards + consultation) moved onto the same `sendMail` helper so every flow uses one sender.
- Update the visible contact email on the thank-you page and homepage only if you want (ask before changing site copy).
- No publishing until you confirm the tests.
