
CREATE TABLE public.pricing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.pricing_leads TO anon;
GRANT INSERT ON public.pricing_leads TO authenticated;
GRANT ALL ON public.pricing_leads TO service_role;

ALTER TABLE public.pricing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.pricing_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (business IS NULL OR char_length(business) <= 200)
  );

CREATE INDEX pricing_leads_email_idx ON public.pricing_leads (email);
CREATE INDEX pricing_leads_created_idx ON public.pricing_leads (created_at DESC);
