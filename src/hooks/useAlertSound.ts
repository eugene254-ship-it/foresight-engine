import { useRef, useCallback } from 'react';

// Generate a short alert tone using Web Audio API
function playAlertTone(type: 'critical' | 'warning' = 'critical') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'critical') {
      // Urgent two-tone beep
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }

    osc.onended = () => ctx.close();
  } catch {
    // Audio not available
  }
}

export function useAlertSound() {
  const lastAlertRef = useRef<Set<string>>(new Set());
  const cooldownRef = useRef(0);

  const checkAndAlert = useCallback((criticalKeys: string[]) => {
    const now = Date.now();
    if (now - cooldownRef.current < 3000) return; // 3s cooldown

    const newKeys = criticalKeys.filter(k => !lastAlertRef.current.has(k));
    if (newKeys.length > 0) {
      playAlertTone('critical');
      cooldownRef.current = now;

      // Send browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Critical Risk Alert', {
          body: `${newKeys.length} new critical threshold breach${newKeys.length > 1 ? 'es' : ''} detected`,
          icon: '/favicon.ico',
          tag: 'risk-alert',
        });
      }
    }

    lastAlertRef.current = new Set(criticalKeys);
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return { checkAndAlert, requestPermission };
}
