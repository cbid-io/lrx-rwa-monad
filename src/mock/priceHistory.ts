/** 7 日「看涨代币价格」模拟序列：`REPLACE_HISTORY_FROM_CHAIN_EVENTS`——实盘请由链上 Swap/Sync 类事件重建时间序列。 */

export type PricePoint = { t: string; bullish: number };

function series(base: number, drift: number, seed: string): PricePoint[] {
  const pts: PricePoint[] = [];
  const now = Date.now();
  let v = base;
  for (let i = 6; i >= 0; i -= 1) {
    const d = (((seed.charCodeAt(i % seed.length) ?? 65) % 17) / 100 - 0.06) * drift;
    v = Math.min(0.94, Math.max(0.06, v + d));
    pts.push({
      t: new Date(now - i * 86400000).toISOString().slice(0, 10),
      bullish: Number(v.toFixed(3)),
    });
  }
  return pts;
}

export const MOCK_BULL_PRICE_HISTORY_BY_ARTWORK: Record<string, PricePoint[]> = {
  '1': series(0.55, 0.08, 'artwork-one'),
  '2': series(0.62, 0.12, 'artwork-two'),
  '3': series(0.52, 0.09, 'artwork-three'),
};

/** 30 日演示延伸（结构与 7 日相同为模拟）。 */
export const MOCK_BULL_PRICE_HISTORY_30D: Record<string, PricePoint[]> = Object.fromEntries(
  Object.entries(MOCK_BULL_PRICE_HISTORY_BY_ARTWORK).map(([id]) => {
    const extended: PricePoint[] = [];
    let v = 0.5;
    const seed = `${id}-30`;
    for (let i = 29; i >= 0; i -= 1) {
      const d = (((seed.charCodeAt(i % seed.length) ?? 65) % 19) / 120 - 0.05) * 0.1;
      v = Math.min(0.94, Math.max(0.06, v + d));
      extended.push({
        t: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        bullish: Number(v.toFixed(3)),
      });
    }
    return [id, extended];
  }),
);
