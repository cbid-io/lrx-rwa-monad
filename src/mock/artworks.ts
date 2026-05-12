/** 此为硬编码演示数据：`totalLockedMon` 实际应从合约 `getPoolTotals(artworkId)` 或服务端聚合读取。 */

export type Artwork = {
  id: string;
  title: string;
  marketTitle: string;
  artist: string;
  detailUrl: string;
  thumbnail: string;
  heroImage: string;
  appraisalValueUsd: number;
  auctionHouse: string;
  auctionDateHkt: string;
  predictionDeadlineHkt: string;
  settlementCurrency: 'HKD';
  priceTiers: Array<{
    id: string;
    label: string;
    thresholdHkd: number;
    probability: number;
    yesPriceCents: number;
    noPriceCents: number;
  }>;
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

/** 首页「当前最热」区块固定展示的艺术品 ID；生产环境请改为 indexer 热门排序首条。 */
export const HOMEPAGE_FEATURED_ARTWORK_ID = '1';

export const MOCK_ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: '俪人行长卷',
    marketTitle: '俪人行长卷将于香港时间20260623举行拍卖，预测最终成交价格',
    artist: '佚名',
    detailUrl: 'https://www.cguardian.com.hk/sc/auction',
    thumbnail: '/lirenxing-scroll.png',
    heroImage: '/lirenxing-scroll.png',
    appraisalValueUsd: 2_180_000,
    auctionHouse: '香港中信拍卖行',
    auctionDateHkt: '2026-06-23',
    predictionDeadlineHkt: '2026-06-22',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-5000w',
        label: '大于等于 5000万港币',
        thresholdHkd: 50_000_000,
        probability: 18,
        yesPriceCents: 18,
        noPriceCents: 82,
      },
      {
        id: 'hkd-3000w',
        label: '大于等于 3000万港币',
        thresholdHkd: 30_000_000,
        probability: 49,
        yesPriceCents: 49,
        noPriceCents: 51,
      },
      {
        id: 'hkd-2000w',
        label: '大于等于 2000万港币',
        thresholdHkd: 20_000_000,
        probability: 72,
        yesPriceCents: 72,
        noPriceCents: 28,
      },
    ],
    /** 占位：最热池子——TVL 高于其他条目以利排序示意。 */
    totalLockedMonWei: '9100000000000000000000',
    predictionEndsAt: Date.now() + 1000 * 60 * 60 * 18,
    year: 2024,
    medium: '绢本设色长卷 · 链上确权与vault托管',
    provenance: ['2023 国内拍卖会记录', '2024 RWA 数字化托管收据', '链上 provenance CID 占位'],
    appraiserOrg: 'ArteMetrics Asia',
    custodian: 'Monad Art Custody HK',
    bullishPrice: 0.67,
    bearishPrice: 0.33,
    lockedBullPct: 64,
    lockedBearPct: 36,
  },
  {
    id: '4',
    title: '五代 柴窑青蓝釉镂雕龙舟福童枕',
    marketTitle: '五代柴窑青蓝釉镂雕龙舟福童枕拍卖最终成交价格预测',
    artist: '五代柴窑',
    detailUrl: 'https://www.christies.com/en/results',
    thumbnail: '/chai-logo.png',
    heroImage: '/chai-logo.png',
    appraisalValueUsd: 32_050_000,
    auctionHouse: '中信国际拍卖公司',
    auctionDateHkt: '2025-10-12',
    predictionDeadlineHkt: '2025-10-11',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-30000w',
        label: '大于等于 3亿港币',
        thresholdHkd: 300_000_000,
        probability: 22,
        yesPriceCents: 22,
        noPriceCents: 78,
      },
      {
        id: 'hkd-20000w',
        label: '大于等于 2亿港币',
        thresholdHkd: 200_000_000,
        probability: 58,
        yesPriceCents: 58,
        noPriceCents: 42,
      },
      {
        id: 'hkd-16000w',
        label: '大于等于 1.6亿港币',
        thresholdHkd: 160_000_000,
        probability: 76,
        yesPriceCents: 76,
        noPriceCents: 24,
      },
    ],
    totalLockedMonWei: '28000000000000000000000',
    predictionEndsAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    year: 950,
    medium: '青蓝釉镂雕瓷枕 · 大周款',
    provenance: ['香港九龙尖沙咀预展', '陶瓷专场拍品编号36', '龙舟福童镂雕器形'],
    appraiserOrg: 'Asia Ceramics Institute',
    custodian: 'Hong Kong Fine Ceramics Vault',
    bullishPrice: 0.58,
    bearishPrice: 0.42,
    lockedBullPct: 61,
    lockedBearPct: 39,
  },
  {
    id: '5',
    title: '元 倪瓒《江亭山色图》',
    marketTitle: '元倪瓒《江亭山色图》拍卖最终成交价格预测',
    artist: '倪瓒',
    detailUrl: 'https://www.christies.com/en/results',
    thumbnail: '/jiangting-shanse.png',
    heroImage: '/jiangting-shanse.png',
    appraisalValueUsd: 20_510_000,
    auctionHouse: '佳士得香港',
    auctionDateHkt: '2025-10-28',
    predictionDeadlineHkt: '2025-10-27',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-20000w',
        label: '大于等于 2亿港币',
        thresholdHkd: 200_000_000,
        probability: 24,
        yesPriceCents: 24,
        noPriceCents: 76,
      },
      {
        id: 'hkd-16000w',
        label: '大于等于 1.6亿港币',
        thresholdHkd: 160_000_000,
        probability: 54,
        yesPriceCents: 54,
        noPriceCents: 46,
      },
      {
        id: 'hkd-12000w',
        label: '大于等于 1.2亿港币',
        thresholdHkd: 120_000_000,
        probability: 78,
        yesPriceCents: 78,
        noPriceCents: 22,
      },
    ],
    totalLockedMonWei: '25000000000000000000000',
    predictionEndsAt: Date.now() - 1000 * 60 * 60 * 24,
    year: 1350,
    medium: '水墨纸本 · 中国古代书画',
    provenance: ['北美私人珍藏', '王季迁家族旧藏', '纽约大都会艺术博物馆借展记录'],
    appraiserOrg: 'Christie’s Asian Art',
    custodian: 'Hong Kong Old Masters Vault',
    bullishPrice: 0.54,
    bearishPrice: 0.46,
    lockedBullPct: 58,
    lockedBearPct: 42,
  },
  {
    id: '6',
    title: '巴布罗·毕加索《女子半身像》',
    marketTitle: '毕加索《女子半身像》拍卖最终成交价格预测',
    artist: '巴布罗·毕加索',
    detailUrl: 'https://www.christies.com/en/results',
    thumbnail:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=75&auto=format&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&q=85&auto=format&fit=crop',
    appraisalValueUsd: 25_220_000,
    auctionHouse: '佳士得香港',
    auctionDateHkt: '2025-10-28',
    predictionDeadlineHkt: '2025-10-27',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-22000w',
        label: '大于等于 2.2亿港币',
        thresholdHkd: 220_000_000,
        probability: 24,
        yesPriceCents: 24,
        noPriceCents: 76,
      },
      {
        id: 'hkd-19000w',
        label: '大于等于 1.9亿港币',
        thresholdHkd: 190_000_000,
        probability: 53,
        yesPriceCents: 53,
        noPriceCents: 47,
      },
      {
        id: 'hkd-16000w',
        label: '大于等于 1.6亿港币',
        thresholdHkd: 160_000_000,
        probability: 74,
        yesPriceCents: 74,
        noPriceCents: 26,
      },
    ],
    totalLockedMonWei: '24000000000000000000000',
    predictionEndsAt: Date.now() - 1000 * 60 * 60 * 30,
    year: 1944,
    medium: '油彩画布 · 二十及二十一世纪晚间拍卖',
    provenance: ['朵拉·玛尔主题作品', '亚洲拍卖纪录焦点拍品', '二战巴黎时期创作'],
    appraiserOrg: 'Christie’s 20/21 Art',
    custodian: 'Hong Kong Modern Art Vault',
    bullishPrice: 0.53,
    bearishPrice: 0.47,
    lockedBullPct: 56,
    lockedBearPct: 44,
  },
  {
    id: '7',
    title: '傅抱石《竹林七贤》',
    marketTitle: '傅抱石《竹林七贤》拍卖最终成交价格预测',
    artist: '傅抱石',
    detailUrl: 'https://www.christies.com/en/results',
    thumbnail: '/zhulin-qixian.png',
    heroImage: '/zhulin-qixian.png',
    appraisalValueUsd: 7_570_000,
    auctionHouse: '佳士得香港',
    auctionDateHkt: '2025-10-20',
    predictionDeadlineHkt: '2025-10-19',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-8000w',
        label: '大于等于 8000万港币',
        thresholdHkd: 80_000_000,
        probability: 18,
        yesPriceCents: 18,
        noPriceCents: 82,
      },
      {
        id: 'hkd-6000w',
        label: '大于等于 6000万港币',
        thresholdHkd: 60_000_000,
        probability: 44,
        yesPriceCents: 44,
        noPriceCents: 56,
      },
      {
        id: 'hkd-5000w',
        label: '大于等于 5000万港币',
        thresholdHkd: 50_000_000,
        probability: 69,
        yesPriceCents: 69,
        noPriceCents: 31,
      },
    ],
    totalLockedMonWei: '21000000000000000000000',
    predictionEndsAt: Date.now() - 1000 * 60 * 60 * 48,
    year: 1946,
    medium: '设色纸本 · 金刚坡时期',
    provenance: ['中国近现代及当代书画专场', '金刚坡时期代表作', '竹林七贤题材'],
    appraiserOrg: 'Christie’s Chinese Paintings',
    custodian: 'Hong Kong Chinese Painting Vault',
    bullishPrice: 0.44,
    bearishPrice: 0.56,
    lockedBullPct: 49,
    lockedBearPct: 51,
  },
  {
    id: '2',
    title: '几何寂静 No.07',
    marketTitle: '几何寂静 No.07 拍卖最终成交价格预测',
    artist: 'Léo Martins',
    detailUrl: 'https://www.sothebys.com/en/departments/contemporary-art',
    thumbnail: '/geometric-silence.png',
    heroImage: '/geometric-silence.png',
    appraisalValueUsd: 890_000,
    auctionHouse: '香港中信拍卖行',
    auctionDateHkt: '2026-07-08',
    predictionDeadlineHkt: '2026-07-07',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-1000w',
        label: '大于等于 1000万港币',
        thresholdHkd: 10_000_000,
        probability: 24,
        yesPriceCents: 24,
        noPriceCents: 76,
      },
      {
        id: 'hkd-700w',
        label: '大于等于 700万港币',
        thresholdHkd: 7_000_000,
        probability: 58,
        yesPriceCents: 58,
        noPriceCents: 42,
      },
      {
        id: 'hkd-500w',
        label: '大于等于 500万港币',
        thresholdHkd: 5_000_000,
        probability: 81,
        yesPriceCents: 81,
        noPriceCents: 19,
      },
    ],
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
    marketTitle: '雾与海·单色摄影 拍卖最终成交价格预测',
    artist: 'Mira Okada',
    detailUrl: 'https://www.phillips.com/photographs',
    thumbnail:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70&auto=format&fit=crop',
    heroImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80&auto=format&fit=crop',
    appraisalValueUsd: 640_000,
    auctionHouse: '香港中信拍卖行',
    auctionDateHkt: '2026-08-19',
    predictionDeadlineHkt: '2026-08-18',
    settlementCurrency: 'HKD',
    priceTiers: [
      {
        id: 'hkd-800w',
        label: '大于等于 800万港币',
        thresholdHkd: 8_000_000,
        probability: 16,
        yesPriceCents: 16,
        noPriceCents: 84,
      },
      {
        id: 'hkd-500w',
        label: '大于等于 500万港币',
        thresholdHkd: 5_000_000,
        probability: 46,
        yesPriceCents: 46,
        noPriceCents: 54,
      },
      {
        id: 'hkd-300w',
        label: '大于等于 300万港币',
        thresholdHkd: 3_000_000,
        probability: 73,
        yesPriceCents: 73,
        noPriceCents: 27,
      },
    ],
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
