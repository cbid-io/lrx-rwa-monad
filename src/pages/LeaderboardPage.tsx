import { useMemo, useState } from 'react';
import { MOCK_LEADERBOARD_ALL } from '@/mock/leaderboard';
import { filterLeaderboardByPreset } from '@/lib/pagination';
import { useAccount } from 'wagmi';
import { formatMon, shortAddress } from '@/lib/format';

type Period = 'all' | 'month' | 'week';

export function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all');
  const { address } = useAccount();

  const rows = useMemo(() => {
    const scoped = filterLeaderboardByPreset(MOCK_LEADERBOARD_ALL, period);
    /** 生产中按 `profitWei` 降序：`orderBy(realizedPnLWei desc)`。 */
    return [...scoped].sort((a, b) => Number(b.profitWei) - Number(a.profitWei));
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">预测盈利排行榜 · 结算版</h1>
        <p className="max-w-2xl text-xs text-neutral-400">
          当前展示 {rows.length.toString()} 条模拟用户；数据源路径：「替换为 indexer /
          GraphQL，例如查询 positions(where: status = SETTLED) 后按 SUM(realizedPnLWei) DESC
          聚合」——注释仅说明逻辑，占位数据请见 <span className="font-mono">src/mock/leaderboard.ts</span>。
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        {(
          [
            ['all', '全部时间'],
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
              <th className="px-4 py-3 font-normal">总盈利 MON</th>
              <th className="px-4 py-3 font-normal">结算次数</th>
              <th className="hidden px-4 py-3 font-normal sm:table-cell">最近结算（mock）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, idx) => {
              const highlighted =
                !!address && address.toLowerCase() === row.rankWallet.toLowerCase();
              const profitBn = BigInt(row.profitWei);
              return (
                <tr
                  key={`${period}-${row.rankWallet}`}
                  className={`text-neutral-200 ${
                    highlighted ? 'bg-accent/15 text-white ring-2 ring-accent/40' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2 font-semibold text-neutral-300">
                      <span>{idx + 1}</span>
                      {highlighted ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-[#15051f]">
                          这是你
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px]">{shortAddress(row.rankWallet)}</td>
                  <td className="px-4 py-3 text-accent">{formatMon(profitBn)}</td>
                  <td className="px-4 py-3">{row.settledCount}</td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                    {new Date(row.settledAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!address ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-4 py-3 text-[11px] text-neutral-500">
          连接钱包后即可在榜上高亮你的地址——若你与示例地址相同则立即匹配；生产中请直接使用真实头寸数据。
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-black/35 px-4 py-3 text-[11px] text-neutral-400">
          当前连接：<span className="font-mono text-neutral-200">{shortAddress(address)}</span> ·
          「若榜上无匹配条目，则说明模拟数据不包含该地址」。正式环境请以链上 indexer 替换。
        </div>
      )}
    </div>
  );
}
