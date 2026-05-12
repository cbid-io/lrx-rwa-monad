import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type PoolSnap = {
  bullish: number;
  bearish: number;
};

/** 占位轮询：`snap` 应优先由 `wagmi`/RPC 周期性读 `getPoolTotals` 回填；此为无合约演示噪声。 */

export function usePoolTicker(seed: PoolSnap, pollMs = 15000) {
  const [snap, setSnap] = useState<PoolSnap>(seed);

  const bump = useCallback(() => {
    setSnap((prev) => {
      const jitter = () => (Math.random() - 0.52) * 0.024;
      const nb = Math.min(0.9, Math.max(0.1, prev.bullish + jitter()));
      const rest = Math.max(0.05, 1 - nb);
      return {
        bullish: Number(nb.toFixed(3)),
        bearish: Number(rest.toFixed(3)),
      };
    });
  }, []);

  const seedRef = useRef(seed);
  seedRef.current = seed;

  useEffect(() => {
    setSnap(seedRef.current);
  }, [seed.bullish, seed.bearish]);

  useEffect(() => {
    const id = window.setInterval(bump, pollMs);
    return () => window.clearInterval(id);
  }, [bump, pollMs]);

  const manualRefresh = useCallback(() => {
    bump();
  }, [bump]);

  const distribution = useMemo(() => {
    const b = snap.bullish / (snap.bullish + snap.bearish);
    return { bullPct: Math.round(b * 100), bearPct: Math.round((1 - b) * 100) };
  }, [snap]);

  return { snap, manualRefresh, distribution };
}
