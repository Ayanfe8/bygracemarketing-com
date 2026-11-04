# Switch contact email to hello@ and refresh the Starter Pack workbooks

## 1. Contact email on the site
Replace bookingswithgrace@gmail.com with hello@bygracemarketing.com (both the visible text and the click-to-email link) on:
- Homepage contact section
- Starter Pack thank-you page ("Need it sooner? Email ...")
- Privacy page
- Unsubscribe page

Nothing else on these pages changes.

## 2. New workbook PDFs
- Replace the two current workbooks with the newly uploaded versions:
  - "DFY_7_Point_Business_Growth_Audit-2.pdf" becomes the 7-Point Business Growth Audit download
  - "DFY_Founders_Growth_Readiness_Checklist-2.pdf" becomes the Founder's Growth Readiness Checklist download
- They keep the current web addresses (no "-2" in the name), so the thank-you page buttons and the emailed download links keep working, including emails already sent.

## 3. Checks
- Both downloads open as PDFs from the thank-you page (phone and desktop size) and match the new files.
- Send one real Starter Pack request and one consultation request to a test address, and confirm:
  - each request is saved
  - the emails are sent from hello@
  - the lead alerts go to hello@
  - the download links in the email open the new PDFs
- Remove the test requests afterwards.
- Nothing gets published.

## Technical details
- Overwrite `public/downloads/DFY_7_Point_Business_Growth_Audit.pdf` and `public/downloads/DFY_Founders_Growth_Readiness_Checklist.pdf` with the uploads; no change needed to `RESOURCE_FILES`.
- Text replacements are in `src/routes/index.tsx`, `resources.business-growth-starter-pack.thank-you.tsx`, `privacy.tsx` and `unsubscribe.tsx`.
