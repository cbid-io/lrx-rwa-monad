import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MOCK_LEADERBOARD_ALL, type LeaderboardRow } from '@/mock/leaderboard';
import { filterLeaderboardByPreset } from '@/lib/pagination';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { formatUsd, shortAddress } from '@/lib/format';

type Period = 'all' | 'month' | 'week';

function compareProfitDesc(a: LeaderboardRow, b: LeaderboardRow): number {
  const left = BigInt(a.profitWei);
  const right = BigInt(b.profitWei);
  if (right > left) return 1;
  if (right < left) return -1;
  return 0;
}

function formatRecentSettlement(settledAt: number, now: number): string {
  const seconds = Math.max(1, Math.floor((now - settledAt) / 1000));
  if (seconds < 60) return `${seconds}秒前`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;

  return `${Math.floor(minutes / 60)}小时前`;
}

function applyLiveProfit(
  row: LeaderboardRow,
  idx: number,
  tick: number,
  now: number,
  isLatest: boolean,
): LeaderboardRow {
  const baseProfit = BigInt(row.profitWei);
  const percentChange = ((tick * 17 + idx * 29) % 37) - 14;
  const nextProfit = (baseProfit * BigInt(100 + percentChange)) / 100n;
  const extraSettlement = (tick + idx) % 4 === 0 ? 1 : 0;
  const recentOffsetSeconds = ((idx * 41 + tick * 5) % 5400) + 3;

  return {
    ...row,
    profitWei: nextProfit.toString(),
    settledCount: row.settledCount + extraSettlement,
    settledAt: isLatest ? now - recentOffsetSeconds * 1000 : row.settledAt,
  };
}

function AnimatedLeaderboardRow({
  row,
  rank,
  address,
  showRelativeTime,
  now,
}: {
  row: LeaderboardRow;
  rank: number;
  address?: `0x${string}`;
  showRelativeTime: boolean;
  now: number;
}) {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const previousTopRef = useRef<number | null>(null);
  const highlighted = !!address && address.toLowerCase() === row.rankWallet.toLowerCase();
  const profitBn = BigInt(row.profitWei);

  useLayoutEffect(() => {
    const element = rowRef.current;
    if (!element) return;

    const nextTop = element.getBoundingClientRect().top;
    const previousTop = previousTopRef.current;
    if (previousTop !== null) {
      const delta = previousTop - nextTop;
      if (Math.abs(delta) > 1) {
        element.animate(
          [
            { transform: `translateY(${delta}px)` },
            { transform: 'translateY(0)' },
          ],
          {
            duration: 520,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          },
        );
      }
    }
    previousTopRef.current = nextTop;
  });

  return (
    <tr
      ref={rowRef}
      className={`text-neutral-200 transition-colors duration-500 ${
        highlighted ? 'bg-accent/15 text-white ring-2 ring-accent/40' : 'hover:bg-white/[0.02]'
      }`}
    >
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2 font-semibold text-neutral-300">
          <span>{rank}</span>
          {highlighted ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-[#15051f]">
              这是你
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-[11px]">{shortAddress(row.rankWallet)}</td>
      <td className="px-4 py-3 text-accent transition-colors duration-500">
        {formatUsd(Number(formatEther(profitBn)))}
      </td>
      <td className="px-4 py-3">{row.settledCount}</td>
      <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
        {showRelativeTime ? formatRecentSettlement(row.settledAt, now) : new Date(row.settledAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

export function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all');
  const [profitTick, setProfitTick] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const { address } = useAccount();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLastUpdatedAt(Date.now());
      setProfitTick((tick) => tick + 1);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const rows = useMemo(() => {
    const scoped = filterLeaderboardByPreset(MOCK_LEADERBOARD_ALL, period);
    /** 生产中按 `profitWei` 降序：`orderBy(realizedPnLWei desc)`。 */
    return scoped
      .map((row, idx) => applyLiveProfit(row, idx, profitTick, lastUpdatedAt, period === 'all'))
      .sort(compareProfitDesc);
  }, [lastUpdatedAt, period, profitTick]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">预测盈利排行榜 · 结算版</h1>
        <p className="max-w-2xl text-xs text-neutral-400">
          当前展示 {rows.length.toString()} 位交易者；榜单按已结算头寸的累计盈利排序，每 5 秒更新排名。
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        {(
          [
            ['all', '最新'],
            ['month', '本月'],
            ['week', '本周'],
          ] as const
        ).map(([k, lab]) => (
          <button
            key={k}
            type="button"
            onClick={() => setPeriod(k)}
            className={`rounded-full px-4 py-1.5 transition ${
              period === k
                ? 'bg-accent text-[#17051f]'
                : 'border border-white/10 text-neutral-300 hover:border-accent/45'
            }`}
          >
            {lab}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="min-w-full divide-y divide-white/5 text-xs">
          <thead className="bg-white/[0.02] text-left text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-normal">名次</th>
              <th className="px-4 py-3 font-normal">钱包</th>
              <th className="px-4 py-3 font-normal">总盈利 $</th>
              <th className="px-4 py-3 font-normal">结算次数</th>
              <th className="hidden px-4 py-3 font-normal sm:table-cell">最近结算</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, idx) => (
              <AnimatedLeaderboardRow
                key={row.rankWallet}
                row={row}
                rank={idx + 1}
                address={address}
                showRelativeTime={period === 'all'}
                now={lastUpdatedAt}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!address ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-4 py-3 text-[11px] text-neutral-500">
          连接钱包后即可在榜上高亮你的地址。
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-black/35 px-4 py-3 text-[11px] text-neutral-400">
          当前连接：<span className="font-mono text-neutral-200">{shortAddress(address)}</span> ·
          若榜上无匹配条目，则说明该地址暂未进入当前榜单。
        </div>
      )}
    </div>
  );
}
