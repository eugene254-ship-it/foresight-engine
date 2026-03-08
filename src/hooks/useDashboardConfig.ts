import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DashboardConfig {
  timeRange: string;
  sector: string;
  scenarioMode: string;
  highConfOnly: boolean;
}

const DEFAULTS: DashboardConfig = {
  timeRange: 'Now',
  sector: 'All',
  scenarioMode: 'Live Risk',
  highConfOnly: false,
};

export function useDashboardConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<DashboardConfig>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('dashboard_configs')
        .select('time_range, sector, scenario_mode, high_conf_only')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setConfig({
          timeRange: data.time_range,
          sector: data.sector,
          scenarioMode: data.scenario_mode,
          highConfOnly: data.high_conf_only,
        });
      }
      setLoaded(true);
    };
    fetch();
  }, [user]);

  const saveConfig = useCallback(async (c: DashboardConfig) => {
    setConfig(c);
    if (!user) return;
    await supabase.from('dashboard_configs').upsert({
      user_id: user.id,
      time_range: c.timeRange,
      sector: c.sector,
      scenario_mode: c.scenarioMode,
      high_conf_only: c.highConfOnly,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }, [user]);

  return { config, saveConfig, loaded };
}
