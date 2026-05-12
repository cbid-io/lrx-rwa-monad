import { useMemo, type ReactNode } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { MOCK_MY_HISTORY, MOCK_MY_POSITIONS, type PredictionStatus } from '@/mock/userData';
import { formatEther } from 'viem';
import { formatUsd, shortAddress } from '@/lib/format';
import { useToast } from '@/context/Toast';
import { PREDICTION_MARKET_ADDRESS, isConfiguredMarketAddress } from '@/config/contracts';
import { predictionMarketAbi } from '@/abi/predictionMarket';
import { MONAD_EXPLORER_TX, monadTestnet } from '@/lib/monad';

const POSITION_ID_BY_MOCK_ROW: Record<string, bigint> = {
  'p-101': 101n,
  'p-102': 102n,
};

function statusLabel(status: PredictionStatus) {
  if (status === 'open') return { text: '进行中', cls: 'text-emerald-300 bg-emerald-500/15' };
  if (status === 'pending_settlement')
    return { text: '待结算', cls: 'text-amber-200 bg-amber-500/15' };
  return { text: '已结算', cls: 'text-neutral-300 bg-white/5' };
}

function formatUsdFromWei(value: bigint): string {
  return formatUsd(Number(formatEther(value)));
}

export function DashboardPage() {
  const { address } = useAccount();
  const { push } = useToast();
  const { writeContractAsync } = useWriteContract();

  const totals = useMemo(() => {
    let stakeWei = 0n;
    let claimableWei = 0n;
    for (const p of MOCK_MY_POSITIONS) {
      stakeWei += BigInt(p.stakeWei);
      claimableWei += BigInt(p.claimableWei);
    }
    /** 生产中：`SUM(stakeWei)`、`SUM(realizedPnLWei)`、`SUM(pendingRewardsWei)` 来自 subgraph。 */
    return { stakeWei, claimableWei };
  }, []);

  async function mockClaim(ids: string[]) {
    if (!address) {
      push('请先连接 Monad Testnet 钱包。');
      return;
    }

    /** 占位：真实场景 `claimRewards(uint256[] positionIds)` 由合约校验 merkle/root。 */
    if (!isConfiguredMarketAddress(PREDICTION_MARKET_ADDRESS)) {
      push(`领取批次已准备：头寸 ${ids.join(', ')}。配置合约地址后即可广播交易。`);
      return;
    }

    try {
      const h = await writeContractAsync({
        account: address,
        chainId: monadTestnet.id,
        abi: predictionMarketAbi,
        address: PREDICTION_MARKET_ADDRESS,
        functionName: 'claimRewards',
        /** 生产中：ids 取自链上 indexer 分页，而非本地占位映射。 */
        args: [
          ids.map((x) => POSITION_ID_BY_MOCK_ROW[x] ?? 999n),
        ],
      });
      push(`奖励领取交易已发送：${MONAD_EXPLORER_TX}${h}`);
    } catch {
      push('批量领取写入失败或未部署合约。', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">个人仪表盘 · 投资组合</h1>
        <p className="max-w-2xl text-xs text-neutral-400">
          查看你的投入、奖励、盈亏和历史交易记录。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <DashboardCard title="累计投入 $" subtitle="open + pending stakes" mono>
          {formatUsdFromWei(totals.stakeWei)}
        </DashboardCard>
        <DashboardCard title="待领取奖励 $" subtitle="pending rewards" mono accent>
          {formatUsdFromWei(totals.claimableWei)}
        </DashboardCard>
        <DashboardCard title="总盈亏" subtitle="realized PnL" mono neutral>
          +$483
        </DashboardCard>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void mockClaim(MOCK_MY_POSITIONS.map((p) => p.id))}
          className="rounded-2xl border border-accent bg-accent-soft px-4 py-2 text-[11px] font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
          disabled={!address}
        >
          一键领取奖励
        </button>
      </div>

      <section className="space-y-3 rounded-3xl border border-white/10 bg-neutral-950/40 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">我的持仓</h2>
            <p className="mt-1 text-[11px] text-neutral-500">
              进行中、待结算和已结算头寸会在这里汇总展示。
            </p>
          </div>
          <div className="text-[11px] text-neutral-500">
            连接：<span className="font-mono text-neutral-200">{address ? shortAddress(address) : '未连接'}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/5 text-[11px]">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-neutral-400">
                <th className="px-4 py-2 font-normal">艺术品</th>
                <th className="px-4 py-2 font-normal">方向</th>
                <th className="px-4 py-2 font-normal">投入</th>
                <th className="hidden px-4 py-2 font-normal md:table-cell">待领</th>
                <th className="px-4 py-2 font-normal">状态</th>
                <th className="px-4 py-2 font-normal" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_MY_POSITIONS.map((p) => {
                const badge = statusLabel(p.status);
                return (
                  <tr key={p.id} className="text-neutral-200">
                    <td className="px-4 py-2 align-middle">
                      <div className="text-xs font-semibold text-white">{p.artworkTitle}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          p.side === 'bull' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-200'
                        }`}
                      >
                        {p.side === 'bull' ? '看涨' : '看跌'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formatUsdFromWei(BigInt(p.stakeWei))}</td>
                    <td className="hidden px-4 py-2 md:table-cell">
                      {formatUsdFromWei(BigInt(p.claimableWei))}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${badge.cls}`}>{badge.text}</span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        disabled={!address || BigInt(p.claimableWei) === 0n}
                        onClick={() => void mockClaim([p.id])}
                        className="rounded-full border border-white/15 px-3 py-1 text-[10px] text-neutral-200 hover:border-accent/45 disabled:opacity-35"
                      >
                        单笔领取
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-white/10 bg-neutral-950/40 p-4">
        <div>
          <h2 className="text-sm font-semibold text-white">历史交易流水</h2>
          <p className="mt-1 text-[11px] text-neutral-500">
            按时间展示你的链上交易记录。
          </p>
        </div>

        <div className="space-y-2">
          {MOCK_MY_HISTORY.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-3"
            >
              <div>
                <div className="text-xs font-semibold text-white">{tx.label}</div>
                <div className="mt-1 text-[11px] text-neutral-500">
                  {new Date(tx.time).toLocaleString()} · {formatUsdFromWei(BigInt(tx.amountWei))}
                </div>
              </div>
              <a
                href={`${MONAD_EXPLORER_TX}${tx.hash}`}
                target="_blank"
                rel="noreferrer"
                className="break-all font-mono text-[11px] text-accent underline underline-offset-2"
              >
                {shortAddress(tx.hash, 8, 6)}
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  children,
  mono,
  accent,
  neutral,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  mono?: boolean;
  accent?: boolean;
  neutral?: boolean;
}) {
  const tone = accent ? 'border-accent bg-accent-soft' : neutral ? 'border-white/15' : 'border-white/10';
  const textTone = accent ? 'text-accent' : 'text-neutral-50';
  return (
    <div className={`rounded-3xl border ${tone} bg-gradient-to-b from-white/[0.04] to-transparent p-4 shadow-lg shadow-purple-950/30`}>
      <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{title}</div>
      {subtitle ? <div className="mt-2 text-[10px] text-neutral-600">{subtitle}</div> : null}
      <div
        className={`mt-4 text-xl font-semibold md:text-2xl ${mono ? 'font-mono' : ''} ${textTone} ${
          accent ? '' : neutral ? 'text-neutral-400' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
