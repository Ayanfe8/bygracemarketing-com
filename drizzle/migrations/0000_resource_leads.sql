CREATE TABLE public.resource_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  business_name text,
  business_type text,
  challenge text,
  source text,
  utm_source text, utm_medium text, utm_campaign text, utm_term text, utm_content text,
  marketing_consent boolean NOT NULL DEFAULT false,
  marketing_consent_at timestamptz,
  waitlist_playbook boolean NOT NULL DEFAULT false,
  waitlist_at timestamptz,
  unsubscribed_at timestamptz,
  access_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  delivery_status text NOT NULL DEFAULT 'pending',
  delivery_attempts integer NOT NULL DEFAULT 0,
  delivered_at timestamptz,
  nurture_day2_sent_at timestamptz,
  nurture_day4_sent_at timestamptz,
  nurture_day7_sent_at timestamptz,
  request_count integer NOT NULL DEFAULT 1,
  last_requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.resource_leads TO service_role;
ALTER TABLE public.resource_leads ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only server code (service role) can read/write.
CREATE INDEX resource_leads_last_requested_idx ON public.resource_leads (last_requested_at);