/** 仪表盘与历史记录占位：接入链上 indexer 后以 `positions({ address })` 替换。 */

export type PredictionStatus = 'open' | 'pending_settlement' | 'settled'; // MOCK 映射

export type UserPositionRow = {
  id: string;
  artworkTitle: string;
  side: 'bull' | 'bear';
  stakeWei: string;
  claimableWei: string;
  status: PredictionStatus;
};

export type UserTxRow = {
  id: string;
  hash: string;
  label: string;
  time: number;
  amountWei: string;
};

export const MOCK_MY_POSITIONS: UserPositionRow[] = [
  {
    id: 'p-101',
    artworkTitle: '俪人行长卷',
    side: 'bull',
    stakeWei: '120000000000000000000',
    claimableWei: '180000000000000000000',
    status: 'open',
  },
  {
    id: 'p-102',
    artworkTitle: '几何寂静 No.07',
    side: 'bear',
    stakeWei: '880000000000000000000',
    claimableWei: '920000000000000000000',
    status: 'pending_settlement',
  },
];

export const MOCK_MY_HISTORY: UserTxRow[] = [
  {
    id: 'tx-901',
    hash: '0xaaaa111122223333444455556666777788889999aaaaaaaaaaaaaaaaaaaaaaaa',
    label: '买入看涨 · 几何寂静 No.07',
    time: Date.now() - 1000 * 60 * 120,
    amountWei: '200000000000000000000',
  },
  {
    id: 'tx-902',
    hash: '0xbbbb111122223333444455556666777788889999bbbbbbbbbbbbbbbbbbbbbbbb',
    label: '领取奖励 · 俪人行长卷',
    time: Date.now() - 1000 * 60 * 60 * 48,
    amountWei: '350000000000000000000',
  },
];

/** 每条预测历史（详情页列表）：应从合约 Events `Trade`/`Buy`/`Sell` paginated logs 组装。 */

export type ArtworkPredictionEvent = {
  id: string;
  actor: string;
  side: 'bull' | 'bear';
  amountWei: string;
  time: number;
};

export const MOCK_PREDICTION_EVENTS_BY_ART: Record<string, ArtworkPredictionEvent[]> = {
  '1': Array.from({ length: 43 }).map((_, i) => ({
    id: `e-1-${i}`,
    actor: [
      '0x8a71f9c2ab4d82e91d3cbb4e4c3c3c3f0b2a1eee',
      '0x3c7d9014f921c3c3fa5c72c3bba3bbd3eef4dddd',
      '0x1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    ][i % 3],
    side: i % 3 === 0 ? 'bull' : 'bear',
    amountWei: `${(BigInt(i + 5) * 10n ** 18n).toString()}`,
    time: Date.now() - i * 1000 * 60 * 17,
  })),
  '2': Array.from({ length: 52 }).map((_, i) => ({
    id: `e-2-${i}`,
    actor: [
      '0x8a71f9c2ab4d82e91d3cbb4e4c3c3c3f0b2a1eee',
      '0xdeadbeef00000000000000000000000000cafe11',
    ][i % 2],
    side: i % 2 === 0 ? 'bull' : 'bear',
    amountWei: `${(BigInt(i + 1) * 10n ** 18n).toString()}`,
    time: Date.now() - i * 1000 * 60 * 23,
  })),
  '3': Array.from({ length: 38 }).map((_, i) => ({
    id: `e-3-${i}`,
    actor: [
      '0xaabbccddeeff00112233445566778899aabbccd',
      '0x22223333444455556666777788889999aaaabbbb',
    ][i % 2],
    side: i % 4 === 0 ? 'bull' : 'bear',
    amountWei: `${(BigInt(i + 2) * 10n ** 18n).toString()}`,
    time: Date.now() - i * 1000 * 60 * 9,
  })),
};
