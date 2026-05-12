export type MarketComment = {
  id: string;
  user: string;
  handle: string;
  time: string;
  badge?: string;
  text: string;
};

export type MarketHolder = {
  id: string;
  wallet: `0x${string}`;
  side: 'yes' | 'no';
  tierLabel: string;
  shares: number;
  valueUsd: number;
};

export type MarketPosition = {
  id: string;
  tierLabel: string;
  side: 'yes' | 'no';
  shares: number;
  avgPriceCents: number;
  pnlUsd: number;
};

export type MarketActivity = {
  id: string;
  wallet: `0x${string}`;
  action: '买入' | '卖出';
  side: 'yes' | 'no';
  tierLabel: string;
  amountUsd: number;
  priceCents: number;
  time: string;
};

export type MarketTabData = {
  comments: MarketComment[];
  holders: MarketHolder[];
  positions: MarketPosition[];
  activity: MarketActivity[];
};

export const MOCK_MARKET_TABS_BY_ARTWORK: Record<string, MarketTabData> = {
  '1': {
    comments: [
      {
        id: 'c-101',
        user: 'HK Art Desk',
        handle: '@hkartdesk',
        time: '2 分钟前',
        badge: '持仓者',
        text: '3000 万港币档位的流动性开始集中，今晚如果拍卖行预展热度继续上升，概率还会被重新定价。',
      },
      {
        id: 'c-102',
        user: 'VaultWatcher',
        handle: '@vaultwatcher',
        time: '18 分钟前',
        text: '这类长卷的成交价很依赖最后两轮竞价，2000 万档位相对稳，5000 万档需要新的买方信号。',
      },
      {
        id: 'c-103',
        user: 'Monad Collector',
        handle: '@monadcollector',
        time: '41 分钟前',
        badge: '顶级持仓',
        text: '我更关注香港中信拍卖行的电话委托席位，若有机构藏家进场，3000 万档会明显变便宜。',
      },
    ],
    holders: [
      {
        id: 'h-101',
        wallet: '0x9A6D5f4C2a78bE01A51cC4f17C80E7A9B5D42a01',
        side: 'yes',
        tierLabel: '大于等于 3000万港币',
        shares: 18240,
        valueUsd: 842.6,
      },
      {
        id: 'h-102',
        wallet: '0x31F2A30A2cdd719c2E4B9966B498C72cC72Dd918',
        side: 'yes',
        tierLabel: '大于等于 2000万港币',
        shares: 15790,
        valueUsd: 691.4,
      },
      {
        id: 'h-103',
        wallet: '0x7dF8E22B412eB3c92F04eCBfe55341Cc1D770f90',
        side: 'no',
        tierLabel: '大于等于 5000万港币',
        shares: 12430,
        valueUsd: 516.2,
      },
    ],
    positions: [
      {
        id: 'p-101',
        tierLabel: '大于等于 3000万港币',
        side: 'yes',
        shares: 680,
        avgPriceCents: 46,
        pnlUsd: 18.7,
      },
      {
        id: 'p-102',
        tierLabel: '大于等于 5000万港币',
        side: 'no',
        shares: 420,
        avgPriceCents: 79,
        pnlUsd: -4.2,
      },
    ],
    activity: [
      {
        id: 'a-101',
        wallet: '0x6eE1982B96Aa5F63bAC2F601b6358eA82f7Ee0AA',
        action: '买入',
        side: 'yes',
        tierLabel: '大于等于 3000万港币',
        amountUsd: 42.8,
        priceCents: 49,
        time: '刚刚',
      },
      {
        id: 'a-102',
        wallet: '0x7dF8E22B412eB3c92F04eCBfe55341Cc1D770f90',
        action: '买入',
        side: 'no',
        tierLabel: '大于等于 5000万港币',
        amountUsd: 31.5,
        priceCents: 82,
        time: '6 分钟前',
      },
      {
        id: 'a-103',
        wallet: '0x31F2A30A2cdd719c2E4B9966B498C72cC72Dd918',
        action: '卖出',
        side: 'yes',
        tierLabel: '大于等于 2000万港币',
        amountUsd: 18.2,
        priceCents: 72,
        time: '14 分钟前',
      },
    ],
  },
};
