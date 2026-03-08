
-- Real-time risk events table
CREATE TABLE public.live_risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  sector TEXT NOT NULL,
  probability NUMERIC NOT NULL,
  severity NUMERIC NOT NULL,
  exposure NUMERIC NOT NULL DEFAULT 0,
  velocity TEXT NOT NULL DEFAULT 'stable',
  confidence TEXT NOT NULL DEFAULT 'medium',
  cascade_potential NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'medium',
  drivers TEXT[] DEFAULT '{}',
  failure_pathway TEXT DEFAULT '',
  interventions TEXT[] DEFAULT '{}',
  impact_window TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow public read access (no auth required for this demo dashboard)
ALTER TABLE public.live_risk_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.live_risk_events
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow insert via service role or authenticated" ON public.live_risk_events
  FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_risk_events;
