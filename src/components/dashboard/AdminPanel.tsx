import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Users, ChevronDown, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { AppRole } from '@/hooks/useUserRole';

interface TeamMember {
  id: string;
  display_name: string | null;
  team: string | null;
  roles: AppRole[];
  thresholds: {
    probability_threshold: number;
    severity_threshold: number;
    sound_enabled: boolean;
  } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    const fetchTeam = async () => {
      setLoading(true);
      const [{ data: profiles }, { data: allRoles }, { data: allThresholds }] = await Promise.all([
        supabase.from('profiles').select('id, display_name, team'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('alert_thresholds').select('user_id, probability_threshold, severity_threshold, sound_enabled'),
      ]);

      const roleMap = new Map<string, AppRole[]>();
      (allRoles ?? []).forEach(r => {
        const existing = roleMap.get(r.user_id) ?? [];
        existing.push(r.role as AppRole);
        roleMap.set(r.user_id, existing);
      });

      const threshMap = new Map<string, TeamMember['thresholds']>();
      (allThresholds ?? []).forEach(t => {
        threshMap.set(t.user_id, {
          probability_threshold: t.probability_threshold,
          severity_threshold: t.severity_threshold,
          sound_enabled: t.sound_enabled,
        });
      });

      setMembers(
        (profiles ?? []).map(p => ({
          id: p.id,
          display_name: p.display_name,
          team: p.team,
          roles: roleMap.get(p.id) ?? ['user'],
          thresholds: threshMap.get(p.id) ?? null,
        }))
      );
      setLoading(false);
    };
    fetchTeam();
  }, [open, user]);

  const toggleRole = async (memberId: string, role: AppRole) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    setSaving(memberId);

    if (member.roles.includes(role)) {
      await supabase.from('user_roles').delete().eq('user_id', memberId).eq('role', role);
      setMembers(ms => ms.map(m => m.id === memberId ? { ...m, roles: m.roles.filter(r => r !== role) } : m));
    } else {
      await supabase.from('user_roles').insert({ user_id: memberId, role });
      setMembers(ms => ms.map(m => m.id === memberId ? { ...m, roles: [...m.roles, role] } : m));
    }
    setSaving(null);
  };

  const updateThreshold = async (memberId: string, field: string, value: number | boolean) => {
    setSaving(memberId);
    await supabase.from('alert_thresholds').upsert({
      user_id: memberId,
      [field]: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    setMembers(ms => ms.map(m => {
      if (m.id !== memberId) return m;
      return {
        ...m,
        thresholds: {
          probability_threshold: m.thresholds?.probability_threshold ?? 75,
          severity_threshold: m.thresholds?.severity_threshold ?? 85,
          sound_enabled: m.thresholds?.sound_enabled ?? true,
          [field]: value,
        },
      };
    }));
    setSaving(null);
  };

  const roleColors: Record<AppRole, string> = {
    admin: 'bg-destructive/20 text-destructive border-destructive/30',
    moderator: 'bg-primary/20 text-primary border-primary/30',
    user: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-destructive" />
                  <h2 className="text-sm font-mono font-semibold text-foreground tracking-wider uppercase">Admin Panel</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {loading ? (
                <div className="text-xs font-mono text-muted-foreground animate-pulse py-8 text-center">Loading team…</div>
              ) : members.length === 0 ? (
                <div className="text-xs font-mono text-muted-foreground py-8 text-center">No team members found</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-mono text-muted-foreground">{members.length} analysts</span>
                  </div>

                  {members.map(member => (
                    <div key={member.id} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="text-left">
                          <div className="text-xs font-mono font-medium text-foreground">
                            {member.display_name || 'Unknown'}
                            {member.id === user?.id && <span className="text-primary ml-1">(you)</span>}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {member.roles.map(role => (
                              <span key={role} className={cn('text-[9px] font-mono px-1.5 py-0.5 rounded border', roleColors[role])}>
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', expandedId === member.id && 'rotate-180')} />
                      </button>

                      <AnimatePresence>
                        {expandedId === member.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                              {/* Role toggles */}
                              <div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Roles</div>
                                <div className="flex gap-1.5">
                                  {(['admin', 'moderator', 'user'] as AppRole[]).map(role => (
                                    <button
                                      key={role}
                                      onClick={() => toggleRole(member.id, role)}
                                      disabled={saving === member.id}
                                      className={cn(
                                        'text-[10px] font-mono px-2 py-1 rounded border transition-all',
                                        member.roles.includes(role) ? roleColors[role] : 'border-border text-muted-foreground/50 hover:text-muted-foreground'
                                      )}
                                    >
                                      {role}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Threshold overrides */}
                              <div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Alert Thresholds</div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-muted-foreground w-12">Prob</span>
                                    <input
                                      type="range" min={10} max={100}
                                      value={member.thresholds?.probability_threshold ?? 75}
                                      onChange={e => updateThreshold(member.id, 'probability_threshold', Number(e.target.value))}
                                      className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                    />
                                    <span className="text-[10px] font-mono text-foreground w-8 text-right">
                                      {member.thresholds?.probability_threshold ?? 75}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-muted-foreground w-12">Sev</span>
                                    <input
                                      type="range" min={10} max={100}
                                      value={member.thresholds?.severity_threshold ?? 85}
                                      onChange={e => updateThreshold(member.id, 'severity_threshold', Number(e.target.value))}
                                      className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                    />
                                    <span className="text-[10px] font-mono text-foreground w-8 text-right">
                                      {member.thresholds?.severity_threshold ?? 85}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
