# Make hello@bygracemarketing.com able to receive email

## What's wrong
The site sent all five test emails successfully: the sending service accepted every one.
They never reached you because your domain currently tells the internet "this domain does not accept email".

- Your DNS has a "null" mail record: MX `0 .`.
- Your Zoho verification record is present, but Zoho's own mail records (MX) were never added.
- Every message sent to any @bygracemarketing.com address is rejected before it reaches Zoho. This includes emails from Gmail or anyone else, not only the website.

## What you do (in the same DNS manager as before)
1. **Delete** the MX record whose value is `.` (priority 0).
2. **Add** these three MX records, with Host `@` for each:
   - `mx.zoho.com`, priority 10
   - `mx2.zoho.com`, priority 20
   - `mx3.zoho.com`, priority 50
3. **Add** one TXT record on Host `@` with the value `v=spf1 include:zoho.com ~all`. Skip this if you already have a TXT record starting with `v=spf1`; tell me and I'll give you the merged value.
4. **Don't change these:**
   - the `185.158.133.1` record
   - the Lovable TXT records
   - the Zoho verification TXT
   - the `resend._domainkey` record
   - the `send` records

If your Zoho admin panel shows different MX values (e.g. `mx.zoho.eu` for an EU account), use the values Zoho shows.

## What I do after you confirm
- Check the new mail records are visible worldwide.
- Send a fresh test from the website to hello@.
- Then run one Starter Pack and one consultation test again, and confirm all four emails arrive.
- Remove the test requests.
- Nothing is published.

No website changes are needed; the sending side already works.
