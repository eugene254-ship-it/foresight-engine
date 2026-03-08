
CREATE TABLE public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_range TEXT NOT NULL DEFAULT 'Now',
  sector TEXT NOT NULL DEFAULT 'All',
  scenario_mode TEXT NOT NULL DEFAULT 'Live Risk',
  high_conf_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own config" ON public.dashboard_configs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON public.dashboard_configs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON public.dashboard_configs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
