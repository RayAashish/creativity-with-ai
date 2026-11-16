import { useState, useEffect } from 'react';

export interface VisitorStats {
  totalVisits: number;
  liveHits: number;
  formatted: string;
  activeNow: number;
  isLoading: boolean;
}

const BASELINE_ASPIRANTS = 1420;
const STORAGE_KEY = 'spdse_visitor_stats';
const SESSION_HIT_KEY = 'spdse_session_counted';

export function useVisitorCount(): VisitorStats {
  const [stats, setStats] = useState<VisitorStats>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.totalVisits) {
          return {
            totalVisits: parsed.totalVisits,
            liveHits: parsed.liveHits || 14,
            formatted: parsed.formatted || Number(parsed.totalVisits).toLocaleString('en-IN'),
            activeNow: parsed.activeNow || 7,
            isLoading: false,
          };
        }
      }
    } catch {
      // LocalStorage access may fail in private mode
    }

    return {
      totalVisits: BASELINE_ASPIRANTS + 14,
      liveHits: 14,
      formatted: (BASELINE_ASPIRANTS + 14).toLocaleString('en-IN'),
      activeNow: 8,
      isLoading: true,
    };
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchVisitorCount() {
      try {
        const response = await fetch('/api/visitors', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        if (isMounted && data.totalVisits) {
          const freshStats: VisitorStats = {
            totalVisits: data.totalVisits,
            liveHits: data.liveHits,
            formatted: data.formatted || Number(data.totalVisits).toLocaleString('en-IN'),
            activeNow: data.activeNow || 7,
            isLoading: false,
          };
          setStats(freshStats);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(freshStats));
          } catch {}
        }
      } catch (err) {
        // Fallback for local Vite preview or offline PWA
        try {
          let localHits = 14;
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            localHits = parsed.liveHits || 14;
          }
          const hasCountedSession = sessionStorage.getItem(SESSION_HIT_KEY);
          if (!hasCountedSession) {
            localHits += 1;
            sessionStorage.setItem(SESSION_HIT_KEY, '1');
          }
          const total = BASELINE_ASPIRANTS + localHits;
          const fallbackStats: VisitorStats = {
            totalVisits: total,
            liveHits: localHits,
            formatted: total.toLocaleString('en-IN'),
            activeNow: 8,
            isLoading: false,
          };
          if (isMounted) {
            setStats(fallbackStats);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackStats));
          }
        } catch {
          if (isMounted) {
            setStats(prev => ({ ...prev, isLoading: false }));
          }
        }
      }
    }

    fetchVisitorCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return stats;
}
