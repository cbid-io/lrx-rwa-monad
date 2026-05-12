/** 此为硬编码演示数据：`totalLockedMon` 实际应从合约 `getPoolTotals(artworkId)` 或服务端聚合读取。 */

export type Artwork = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  heroImage: string;
  appraisalValueUsd: number;
  /** MOCK：链上 wei 占位，用于排序——实盘请读合约总锁仓。 */
  totalLockedMonWei: string;
  predictionEndsAt: number;
  year: number;
  medium: string;
  provenance: string[];
  appraiserOrg: string;
  custodian: string;
  /** 看涨份额价格或隐含概率 0–1；实盘应由 AMM/reserve + `getPoolTotals` 推导。 */
  bullishPrice: number;
  bearishPrice: number;
  lockedBullPct: number;
  lockedBearPct: number;
  /** 结算后出现；实盘取自预言机 finalize 事件或 indexer。 */
  finalRealPriceUsd?: number;
};

export const MOCK_ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: '星夜手稿·蓝调变奏',
    artist: 'Ada Chen',
    thumbnail:
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&q=70&auto=format&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1400&q=80&auto=format&fit=crop',
    appraisalValueUsd: 1_250_000,
    totalLockedMonWei: '4200000000000000000000',
    predictionEndsAt: Date.now() + 1000 * 60 * 60 * 26,
    year: 2019,
    medium: '布面油画 / 霓虹媒介层',
    provenance: ['2019 Geneva Private Sale', '2021 Sothebys Digital Archive', '2024 RWA Custody Vault'],
    appraiserOrg: 'Swiss ArteVerify Lab',
    custodian: 'Monad Art Vault Zurich',
    bullishPrice: 0.61,
    bearishPrice: 0.39,
    lockedBullPct: 58,
    lockedBearPct: 42,
  },
  {
    id: '2',
    title: '几何寂静 No.07',
    artist: 'Léo Martins',
    thumbnail:
      'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?w=600&q=70&auto=format&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?w=1400&q=80&auto=format&fit=crop',
    appraisalValueUsd: 890_000,
    totalLockedMonWei: '3100000000000000000000',
    predictionEndsAt: Date.now() - 1000 * 60 * 60 * 12,
    year: 2016,
    medium: '珐琅铝板 / UV 保护层',
    provenance: ['2016 Lisbon Studio', '2019 Paris Custody Upgrade'],
    appraiserOrg: 'EU ArteMetrics',
    custodian: 'Paris Digital Fine Art Custody',
    bullishPrice: 0.72,
    bearishPrice: 0.28,
    lockedBullPct: 70,
    lockedBearPct: 30,
    finalRealPriceUsd: 942_000,
  },
  {
    id: '3',
    title: '雾与海·单色摄影',
    artist: 'Mira Okada',
    thumbnail:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70&auto=format&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80&auto=format&fit=crop',
    appraisalValueUsd: 640_000,
    totalLockedMonWei: '1800000000000000000000',
    predictionEndsAt: Date.now() + 1000 * 60 * 60 * 72,
    year: 2022,
    medium: '银盐放大 / archival print',
    provenance: ['2022 Kyoto Edition', '2023 On-chain Mint Record'],
    appraiserOrg: 'Tokyo Provenance DAO',
    custodian: 'Kyoto Offline Vault + On-chain Receipt',
    bullishPrice: 0.54,
    bearishPrice: 0.46,
    lockedBullPct: 48,
    lockedBearPct: 52,
  },
];
