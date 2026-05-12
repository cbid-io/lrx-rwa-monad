/** 排行榜模拟数据：`profitWei`/`count`/`settledAt` 应从 subgraph / indexer 查询已结算头寸聚合。 */

export type LeaderboardRow = {
  rankWallet: string;
  profitWei: string;
  settledCount: number;
  settledAt: number;
};

export const MOCK_LEADERBOARD_ALL: LeaderboardRow[] = [
  {
    rankWallet: '0x8a71f9c2ab4d82e91d3cbb4e4c3c3c3f0b2a1eee',
    profitWei: '1820000000000000000000',
    settledCount: 34,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
  {
    rankWallet: '0x3c7d9014f921c3c3fa5c72c3bba3bbd3eef4dddd',
    profitWei: '1410000000000000000000',
    settledCount: 28,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    rankWallet: '0x1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    profitWei: '1290000000000000000000',
    settledCount: 22,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  },
  {
    rankWallet: '0xaabbccddeeff00112233445566778899aabbccd',
    profitWei: '980000000000000000000',
    settledCount: 19,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    rankWallet: '0xdeadbeef00000000000000000000000000cafe11',
    profitWei: '870000000000000000000',
    settledCount: 16,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    rankWallet: '0x22223333444455556666777788889999aaaabbbb',
    profitWei: '760000000000000000000',
    settledCount: 15,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    rankWallet: '0x3333444455556666777788889999aaaabbbbcccc',
    profitWei: '690000000000000000000',
    settledCount: 14,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    rankWallet: '0x444455556666777788889999aaaabbbbccccdddd',
    profitWei: '610000000000000000000',
    settledCount: 13,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
  },
  {
    rankWallet: '0x55556666777788889999aaaabbbbccccddddeeee',
    profitWei: '540000000000000000000',
    settledCount: 11,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
  {
    rankWallet: '0x6666777788889999aaaabbbbccccddddeeeeffff',
    profitWei: '480000000000000000000',
    settledCount: 11,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    rankWallet: '0x777788889999aaaabbbbccccddddeeeeffff0000',
    profitWei: '410000000000000000000',
    settledCount: 10,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    rankWallet: '0x88889999aaaabbbbccccddddeeeeffff00001111',
    profitWei: '360000000000000000000',
    settledCount: 10,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
  },
  {
    rankWallet: '0x9999aaaabbbbccccddddeeeeffff000011112222',
    profitWei: '330000000000000000000',
    settledCount: 9,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    rankWallet: '0xaaaabbbbccccddddeeeeffff0000111122223333',
    profitWei: '290000000000000000000',
    settledCount: 9,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    rankWallet: '0xbbbbccccddddeeeeffff00001111222333334444',
    profitWei: '250000000000000000000',
    settledCount: 8,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
  },
  {
    rankWallet: '0xccccddddeeeeffff000011112222333344445555',
    profitWei: '210000000000000000000',
    settledCount: 8,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    rankWallet: '0xddddeeeeffff0000111122223333444455556666',
    profitWei: '180000000000000000000',
    settledCount: 8,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 210,
  },
  {
    rankWallet: '0xeeeeffff00001111222233334444555566667777',
    profitWei: '150000000000000000000',
    settledCount: 7,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    rankWallet: '0xffff000011112222333344445555666677778888',
    profitWei: '120000000000000000000',
    settledCount: 7,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 330,
  },
  {
    rankWallet: '0x0000111122223333444455556666777788889999',
    profitWei: '90000000000000000000',
    settledCount: 6,
    settledAt: Date.now() - 1000 * 60 * 60 * 24 * 300,
  },
];
