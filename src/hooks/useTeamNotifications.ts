import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useTeamNotifications() {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('team-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alert_thresholds' },
        (payload) => {
          const userId = (payload.new as any)?.user_id;
          if (userId && userId !== user.id) {
            toast.info('Team alert thresholds updated', {
              description: 'A team member changed their alert configuration.',
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_risk_events' },
        (payload) => {
          const event = payload.new as any;
          if (payload.eventType === 'INSERT') {
            toast.warning(`New risk event: ${event?.name ?? 'Unknown'}`, {
              description: `Sector: ${event?.sector} • Severity: ${event?.severity}`,
              duration: 6000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = event?.status;
            if (oldStatus !== newStatus) {
              toast.info(`Risk status changed: ${event?.name ?? 'Unknown'}`, {
                description: `${oldStatus} → ${newStatus}`,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user]);
}
