import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveRiskEvent {
  id: string;
  event_key: string;
  name: string;
  region: string;
  sector: string;
  probability: number;
  severity: number;
  exposure: number;
  velocity: string;
  confidence: string;
  cascade_potential: number;
  status: string;
  drivers: string[];
  failure_pathway: string;
  interventions: string[];
  impact_window: string;
  created_at: string;
  updated_at: string;
}

export interface RealtimeStatus {
  connected: boolean;
  lastEventAt: Date | null;
  eventCount: number;
}

export function useRealtimeRisks() {
  const [latestEvents, setLatestEvents] = useState<Map<string, LiveRiskEvent>>(new Map());
  const [status, setStatus] = useState<RealtimeStatus>({
    connected: false,
    lastEventAt: null,
    eventCount: 0,
  });
  const eventCountRef = useRef(0);

  // Fetch initial data
  useEffect(() => {
    const fetchInitial = async () => {
      // Get the latest event per event_key
      const { data } = await supabase
        .from('live_risk_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const map = new Map<string, LiveRiskEvent>();
        // Keep only the latest per event_key
        for (const row of data as unknown as LiveRiskEvent[]) {
          if (!map.has(row.event_key)) {
            map.set(row.event_key, row);
          }
        }
        setLatestEvents(map);
        eventCountRef.current = data.length;
        setStatus(s => ({ ...s, eventCount: data.length, lastEventAt: new Date(data[0].created_at) }));
      }
    };
    fetchInitial();
  }, []);

  // Subscribe to realtime
  useEffect(() => {
    const channel = supabase
      .channel('live-risk-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_risk_events' },
        (payload) => {
          const newEvent = payload.new as unknown as LiveRiskEvent;
          setLatestEvents(prev => {
            const next = new Map(prev);
            next.set(newEvent.event_key, newEvent);
            return next;
          });
          eventCountRef.current += 1;
          setStatus(s => ({
            connected: true,
            lastEventAt: new Date(),
            eventCount: eventCountRef.current,
          }));
        }
      )
      .subscribe((status) => {
        setStatus(s => ({ ...s, connected: status === 'SUBSCRIBED' }));
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const events = Array.from(latestEvents.values());

  return { events, status };
}
