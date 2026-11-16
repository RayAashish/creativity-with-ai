import React, { useEffect, useState, useRef } from 'react';
import './live-counter.css';

interface LiveStats {
  total: number;
  active: number;
}

const STORAGE_ID_KEY = 'live_visitor_id';
const SESSION_FLAG_KEY = 'live_session_counted';
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
const MAX_BACKOFF_MS = 120000;       // 2 minutes

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_ID_KEY);
    if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) {
      return existing;
    }
  } catch {}

  let newId = '';
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    newId = crypto.randomUUID();
  } else {
    newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  try {
    localStorage.setItem(STORAGE_ID_KEY, newId);
  } catch {}

  return newId;
}

export const LiveCounter: React.FC = () => {
  // Check if live counter is switched off via feature flag (e.g. VITE_LIVE_COUNTER=off or NEXT_PUBLIC_LIVE_COUNTER=off)
  const isEnabled = (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_LIVE_COUNTER !== 'off') &&
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_LIVE_COUNTER !== 'off')
  );

  const [stats, setStats] = useState<LiveStats | null>(null);
  const backoffRef = useRef<number>(5000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isEnabled) return;

    isUnmountedRef.current = false;
    const visitorId = getOrCreateVisitorId();

    // Check if this browser session has already incremented total visits
    let isNewSession = false;
    try {
      if (!sessionStorage.getItem(SESSION_FLAG_KEY)) {
        isNewSession = true;
        sessionStorage.setItem(SESSION_FLAG_KEY, '1');
      }
    } catch {
      isNewSession = true;
    }

    let hasDoneFirstPing = false;

    async function sendPing(newSession: boolean) {
      if (document.visibilityState !== 'visible' || isUnmountedRef.current) {
        return;
      }

      try {
        const response = await fetch('/api/live/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: visitorId, newSession }),
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        if (data && data.ok && typeof data.total === 'number' && typeof data.active === 'number') {
          if (!isUnmountedRef.current) {
            setStats({ total: data.total, active: data.active });
            backoffRef.current = 5000; // Reset backoff on success
          }
        } else {
          // Fail silent: hide counter on database error or ok:false
          if (!isUnmountedRef.current) {
            setStats(null);
            scheduleRetry();
          }
        }
      } catch {
        // Fail silent: network error / unconfigured backend
        if (!isUnmountedRef.current) {
          setStats(null);
          scheduleRetry();
        }
      }
    }

    function scheduleRetry() {
      if (timerRef.current) clearTimeout(timerRef.current);
      const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
      backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
      timerRef.current = setTimeout(() => {
        if (!isUnmountedRef.current && document.visibilityState === 'visible') {
          sendPing(false);
        }
      }, delay);
    }

    // Initial ping on load (deferred after mount)
    const initTimer = setTimeout(() => {
      sendPing(isNewSession);
      hasDoneFirstPing = true;
    }, 150);

    // Heartbeat every 30 seconds while tab is visible
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendPing(false);
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Resume immediately when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasDoneFirstPing) {
        sendPing(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isUnmountedRef.current = true;
      clearTimeout(initTimer);
      clearInterval(heartbeatInterval);
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isEnabled]);

  // If disabled or pending response or failed: show absolutely nothing (no 0, no skeleton, no flicker)
  if (!isEnabled || !stats) {
    return null;
  }

  return (
    <div
      className="live-counter-container pt-1.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tabular-nums select-none flex items-center gap-1.5"
      title="Counts anonymous visits using a random ID stored in your browser. No personal data is collected."
    >
      <span>{stats.total.toLocaleString()} visits</span>
      <span className="opacity-30">·</span>
      <span className="live-counter-dot" aria-hidden="true" />
      <span>{stats.active.toLocaleString()} online now</span>
    </div>
  );
};
