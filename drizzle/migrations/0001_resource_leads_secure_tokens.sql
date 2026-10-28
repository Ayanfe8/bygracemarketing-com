ALTER TABLE public.resource_leads
  ADD COLUMN unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN confirm_token uuid,
  ADD COLUMN confirm_sent_at timestamptz,
  ADD COLUMN pending_marketing boolean NOT NULL DEFAULT false,
  ADD COLUMN pending_waitlist boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX resource_leads_unsubscribe_token_idx ON public.resource_leads (unsubscribe_token);
CREATE UNIQUE INDEX resource_leads_confirm_token_idx ON public.resource_leads (confirm_token);
COMMENT ON COLUMN public.resource_leads.access_token IS 'DEPRECATED: replaced by resource_receipts.token (receipts) and unsubscribe_token/confirm_token (emailed only)';

CREATE TABLE public.resource_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.resource_leads(id) ON DELETE CASCADE,
  delivery_status text NOT NULL DEFAULT 'pending',
  consent_requested boolean NOT NULL DEFAULT false,
  waitlist_requested boolean NOT NULL DEFAULT false,
  retry_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.resource_receipts TO service_role;
ALTER TABLE public.resource_receipts ENABLE ROW LEVEL SECURITY;