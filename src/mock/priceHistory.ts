/** 7 日「看涨代币价格」模拟序列：`REPLACE_HISTORY_FROM_CHAIN_EVENTS`——实盘请由链上 Swap/Sync 类事件重建时间序列。 */

export type PricePoint = { t: string; bullish: number };

/** 历史拍卖成交价模拟数据：实际应由拍卖行成交公告 / 预言机 / indexer 写入。 */
export type AuctionPricePoint = {
  t: string;
  auctionPriceHkd: number;
  auctionHouse: string;
};

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
  '4': series(0.58, 0.1, 'chai-yao-pillow'),
  '5': series(0.54, 0.11, 'ni-zan-scroll'),
  '6': series(0.53, 0.1, 'picasso-bust'),
  '7': series(0.44, 0.09, 'fu-baoshi-seven-sages'),
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

export const MOCK_AUCTION_PRICE_HISTORY_BY_ARTWORK: Record<string, AuctionPricePoint[]> = {
  '1': [
    { t: '2017-11-18', auctionPriceHkd: 12_800_000, auctionHouse: '香港中信拍卖行' },
    { t: '2019-05-26', auctionPriceHkd: 18_600_000, auctionHouse: '香港中信拍卖行' },
    { t: '2021-10-03', auctionPriceHkd: 23_400_000, auctionHouse: '香港中信拍卖行' },
    { t: '2023-04-21', auctionPriceHkd: 31_200_000, auctionHouse: '香港中信拍卖行' },
    { t: '2025-12-09', auctionPriceHkd: 42_500_000, auctionHouse: '香港中信拍卖行' },
  ],
  '2': [
    { t: '2016-06-12', auctionPriceHkd: 2_900_000, auctionHouse: '香港中信拍卖行' },
    { t: '2018-10-19', auctionPriceHkd: 4_150_000, auctionHouse: '香港中信拍卖行' },
    { t: '2020-09-30', auctionPriceHkd: 4_900_000, auctionHouse: '香港中信拍卖行' },
    { t: '2022-11-07', auctionPriceHkd: 6_300_000, auctionHouse: '香港中信拍卖行' },
    { t: '2025-05-16', auctionPriceHkd: 7_600_000, auctionHouse: '香港中信拍卖行' },
  ],
  '3': [
    { t: '2018-03-04', auctionPriceHkd: 1_200_000, auctionHouse: '香港中信拍卖行' },
    { t: '2019-12-15', auctionPriceHkd: 1_850_000, auctionHouse: '香港中信拍卖行' },
    { t: '2021-07-22', auctionPriceHkd: 2_400_000, auctionHouse: '香港中信拍卖行' },
    { t: '2023-08-11', auctionPriceHkd: 3_180_000, auctionHouse: '香港中信拍卖行' },
    { t: '2025-09-27', auctionPriceHkd: 4_260_000, auctionHouse: '香港中信拍卖行' },
  ],
  '4': [
    { t: '2011-05-18', auctionPriceHkd: 88_000_000, auctionHouse: '中信国际拍卖公司' },
    { t: '2015-10-22', auctionPriceHkd: 126_000_000, auctionHouse: '中信国际拍卖公司' },
    { t: '2019-04-16', auctionPriceHkd: 168_000_000, auctionHouse: '中信国际拍卖公司' },
    { t: '2022-11-28', auctionPriceHkd: 216_000_000, auctionHouse: '中信国际拍卖公司' },
    { t: '2025-10-12', auctionPriceHkd: 260_000_000, auctionHouse: '中信国际拍卖公司' },
  ],
  '5': [
    { t: '2008-11-03', auctionPriceHkd: 42_000_000, auctionHouse: '佳士得香港' },
    { t: '2012-05-29', auctionPriceHkd: 68_000_000, auctionHouse: '佳士得香港' },
    { t: '2016-11-28', auctionPriceHkd: 93_000_000, auctionHouse: '佳士得香港' },
    { t: '2021-05-25', auctionPriceHkd: 132_000_000, auctionHouse: '佳士得香港' },
    { t: '2025-10-28', auctionPriceHkd: 159_950_000, auctionHouse: '佳士得香港' },
  ],
  '6': [
    { t: '2009-02-09', auctionPriceHkd: 64_000_000, auctionHouse: '佳士得香港' },
    { t: '2013-06-19', auctionPriceHkd: 92_000_000, auctionHouse: '佳士得香港' },
    { t: '2017-11-13', auctionPriceHkd: 118_000_000, auctionHouse: '佳士得香港' },
    { t: '2021-12-01', auctionPriceHkd: 156_000_000, auctionHouse: '佳士得香港' },
    { t: '2025-10-28', auctionPriceHkd: 196_750_000, auctionHouse: '佳士得香港' },
  ],
  '7': [
    { t: '2007-10-08', auctionPriceHkd: 12_800_000, auctionHouse: '佳士得香港' },
    { t: '2011-05-30', auctionPriceHkd: 21_600_000, auctionHouse: '佳士得香港' },
    { t: '2015-11-30', auctionPriceHkd: 32_400_000, auctionHouse: '佳士得香港' },
    { t: '2020-07-10', auctionPriceHkd: 45_500_000, auctionHouse: '佳士得香港' },
    { t: '2025-10-20', auctionPriceHkd: 59_060_000, auctionHouse: '佳士得香港' },
  ],
};
