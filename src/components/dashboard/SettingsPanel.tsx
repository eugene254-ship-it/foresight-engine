import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AlertThresholds {
  probability_threshold: number;
  severity_threshold: number;
  sound_enabled: boolean;
}

const DEFAULTS: AlertThresholds = {
  probability_threshold: 75,
  severity_threshold: 85,
  sound_enabled: true,
};

export function useAlertThresholds() {
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('alert_thresholds')
        .select('probability_threshold, severity_threshold, sound_enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setThresholds(data as AlertThresholds);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const save = useCallback(async (t: AlertThresholds) => {
    if (!user) return;
    setThresholds(t);
    await supabase.from('alert_thresholds').upsert({
      user_id: user.id,
      ...t,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }, [user]);

  return { thresholds, save, loading };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ open, onClose }: Props) => {
  const { thresholds, save } = useAlertThresholds();
  const [local, setLocal] = useState(thresholds);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal(thresholds);
  }, [thresholds]);

  const handleSave = async () => {
    setSaving(true);
    await save(local);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-mono font-semibold text-foreground tracking-wider uppercase">Alert Settings</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Probability Threshold */}
              <div className="mb-5">
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">
                  Probability Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={local.probability_threshold}
                    onChange={e => setLocal(p => ({ ...p, probability_threshold: Number(e.target.value) }))}
                    className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <span className={cn(
                    'text-sm font-mono font-bold tabular-nums min-w-[40px] text-right',
                    local.probability_threshold >= 75 ? 'text-destructive' : 'text-primary'
                  )}>
                    {local.probability_threshold}%
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Alert when probability ≥ {local.probability_threshold}%
                </p>
              </div>

              {/* Severity Threshold */}
              <div className="mb-5">
                <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">
                  Severity Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={local.severity_threshold}
                    onChange={e => setLocal(p => ({ ...p, severity_threshold: Number(e.target.value) }))}
                    className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                  <span className={cn(
                    'text-sm font-mono font-bold tabular-nums min-w-[40px] text-right',
                    local.severity_threshold >= 85 ? 'text-destructive' : 'text-primary'
                  )}>
                    {local.severity_threshold}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Alert when severity ≥ {local.severity_threshold}/100
                </p>
              </div>

              {/* Sound Toggle */}
              <div className="mb-6 flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                <div>
                  <div className="text-xs font-mono font-medium text-foreground">Sound Alerts</div>
                  <div className="text-[10px] font-mono text-muted-foreground">Audio tone on breach</div>
                </div>
                <button
                  onClick={() => setLocal(p => ({ ...p, sound_enabled: !p.sound_enabled }))}
                  className={cn(
                    'w-10 h-5 rounded-full transition-colors relative',
                    local.sound_enabled ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform',
                    local.sound_enabled ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLocal(DEFAULTS)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
