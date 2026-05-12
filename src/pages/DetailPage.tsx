import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import { MOCK_ARTWORKS } from '@/mock/artworks';
import {
  MOCK_BULL_PRICE_HISTORY_30D,
  MOCK_BULL_PRICE_HISTORY_BY_ARTWORK,
  type PricePoint,
} from '@/mock/priceHistory';
import {
  MOCK_PREDICTION_EVENTS_BY_ART,
  type ArtworkPredictionEvent,
} from '@/mock/userData';
import { countdownLabel, formatUsd, shortAddress } from '@/lib/format';
import { FAUCET_INFO } from '@/lib/monad';
import { paginatePredictionsHistory } from '@/lib/pagination';
import { PriceMiniChart } from '@/components/PriceMiniChart';
import { predictionMarketAbi } from '@/abi/predictionMarket';
import { useToast } from '@/context/Toast';
import { PREDICTION_MARKET_ADDRESS, isConfiguredMarketAddress } from '@/config/contracts';
import { usePoolTicker } from '@/hooks/usePoolTicker';
import { MONAD_EXPLORER_TX, monadTestnet } from '@/lib/monad';
import { useTxReceiptFeedback } from '@/hooks/useTxFeedback';

type RangePreset = '7d' | '30d';

function SettlementBlock({
  artworkId,
}: {
  artworkId: string;
}) {
  const artwork = MOCK_ARTWORKS.find((a) => a.id === artworkId);
  if (!artwork?.finalRealPriceUsd) return null;
  const est = artwork.appraisalValueUsd;

  const steps = [
    { title: '锁仓到期', meta: artwork.predictionEndsAt + 1000 * 60 },
    {
      title: '预言机上链',
      meta: artwork.predictionEndsAt + 1000 * 60 * 32,
      note: `依据 ArteMetrics + ${artwork.appraiserOrg} 线下估值快照`,
    },
    {
      title: 'AMM 头寸结算',
      meta: artwork.predictionEndsAt + 1000 * 60 * 90,
      note: `调用合约结算函数（演示文案；替换为实盘 finalizeSettlement）`,
    },
  ];

  return (
    <div className="space-y-4 rounded-3xl border border-accent/35 bg-accent-soft px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">预测结果与结算依据</h3>
        <span className="rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-accent">
          SETTLED MOCK
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <div className="rounded-2xl bg-white/[0.02] px-4 py-3">
          <div className="text-[11px] text-neutral-500">成交价（Oracle 入账）</div>
          <div className="mt-2 text-xl font-semibold text-white">{formatUsd(artwork.finalRealPriceUsd)}</div>
          <div className="mt-2 text-[11px] text-neutral-500">预测期估值快照</div>
          <div className="mt-1 text-lg text-accent">{formatUsd(est)}</div>
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
            价差 {formatUsd(artwork.finalRealPriceUsd - est)}，
            「判定文案」：若成交价高于池中多方阈值，看涨头寸按份额占比领取奖励；以下为演示说明，请以正式合约白皮书为准。
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-3 text-xs text-neutral-300">
          <div className="text-[11px] font-semibold text-neutral-200">判定依据摘要</div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-neutral-400">
            <li>托管收据链上 CID + 离线鉴定 PDF 哈希（演示占位）</li>
            <li>预言机数据源：EU ArteMetrics 官方 API（替换为实盘 URL）</li>
            <li>结算窗口触发事件：`predictionSettled(bytes32,uint256,uint256)`</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold text-neutral-200">结算时间轴</div>
        <div className="relative mt-3 space-y-3 border-l border-dashed border-white/15 pl-4">
          {steps.map((s) => (
            <div key={s.title} className="relative pl-3">
              <span className="absolute -left-[7px] top-2 h-2 w-2 rounded-full bg-accent" />
              <div className="text-xs font-semibold text-white">{s.title}</div>
              <div className="text-[11px] text-neutral-500">
                {new Date(s.meta).toLocaleString()}
              </div>
              {s.note ? <div className="mt-1 text-[11px] text-neutral-400">{s.note}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryTable({
  rows,
}: {
  rows: readonly ArtworkPredictionEvent[];
}) {
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const headId = rows[0]?.id;

  useEffect(() => {
    /** 切换到不同艺术品时复位分页：`rows` 实际由合约分页游标驱动。 */
    setPage(1);
  }, [rows.length, headId]);
  const sliced = useMemo(() => paginatePredictionsHistory(rows, page, pageSize), [rows, page]);
  const totalPages = Math.max(1, Math.ceil(sliced.total / pageSize));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/5 text-[11px]">
          <thead className="bg-white/[0.02]">
            <tr className="text-left text-neutral-400">
              <th className="px-4 py-2 font-normal">参与者</th>
              <th className="px-4 py-2 font-normal">方向</th>
              <th className="px-4 py-2 font-normal">数额</th>
              <th className="hidden px-4 py-2 font-normal sm:table-cell">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sliced.items.map((r) => (
              <tr key={r.id} className="text-neutral-200">
                <td className="px-4 py-2 font-mono text-[11px]">{shortAddress(r.actor)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      r.side === 'bull'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {r.side === 'bull' ? '看涨' : '看跌'}
                  </span>
                </td>
                <td className="px-4 py-2">{Number(formatEther(BigInt(r.amountWei))).toFixed(2)} MON</td>
                <td className="hidden whitespace-nowrap px-4 py-2 text-neutral-500 sm:table-cell">
                  {new Date(r.time).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span>
          第 {page} / {totalPages} 页「替换为 indexer 分页游标」。
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 disabled:opacity-40"
          >
            上一页
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailPage() {
  const { id } = useParams();

  /** `MOCK_ARTWORKS` 为常量，`find` 结果按 `id` 记忆化为稳定引用。 */
  const artworkCandidate = useMemo(() => MOCK_ARTWORKS.find((a) => a.id === id), [id]);

  const poolSeed = useMemo(() => {
    if (!artworkCandidate) return { bullish: 0.5, bearish: 0.5 };
    return {
      bullish: artworkCandidate.bullishPrice,
      bearish: artworkCandidate.bearishPrice,
    };
  }, [artworkCandidate]);

  const now = Date.now();
  const { push } = useToast();

  const [range, setRange] = useState<RangePreset>('7d');
  const [outcome, setOutcome] = useState<'bull' | 'bear'>('bull');
  const [amount, setAmount] = useState('0.05');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const confirming = useTxReceiptFeedback(txHash).confirming;

  const ticker = usePoolTicker(poolSeed);

  const chartData: PricePoint[] = useMemo(() => {
    if (!artworkCandidate) return [];
    const src =
      range === '7d'
        ? MOCK_BULL_PRICE_HISTORY_BY_ARTWORK[artworkCandidate.id]
        : MOCK_BULL_PRICE_HISTORY_30D[artworkCandidate.id];
    return src ?? MOCK_BULL_PRICE_HISTORY_BY_ARTWORK[artworkCandidate.id] ?? [];
  }, [artworkCandidate, range]);

  if (!id || !artworkCandidate) {
    return <Navigate to="/" replace />;
  }

  const artwork = artworkCandidate;

  const predictionOpen = artwork.predictionEndsAt > now;
  const explorerBase = MONAD_EXPLORER_TX;
  const onTrade = async () => {
    if (!address) {
      push('请先连接钱包再进行预测。');
      return;
    }
    if (chainId && chainId !== monadTestnet.id) {
      push('请将钱包切换到 Monad Testnet（链 ID 10143）。', 'error');
      return;
    }
    if (!predictionOpen) {
      push('本场预测窗口已关闭。');
      return;
    }

    let value: bigint;
    try {
      value = parseEther(amount);
    } catch {
      push('请输入合法的 MON 数量（形如 0.05）。');
      return;
    }

    if (value <= 0n) {
      push('金额必须大于 0。');
      return;
    }

    if (!isConfiguredMarketAddress(PREDICTION_MARKET_ADDRESS)) {
      push('尚未配置合约地址：`VITE_PREDICTION_MARKET_ADDRESS`，当前为离线演示模式。');
      return;
    }

    try {
      setTxHash(undefined);
      push('等待钱包弹出签名面板…');

      const h = await writeContractAsync({
        account: address,
        address: PREDICTION_MARKET_ADDRESS,
        abi: predictionMarketAbi,
        chainId: monadTestnet.id,
        functionName: 'buyOutcome',
        /** 此方法名与 ABI 与实际部署合约对齐；参数顺序请按链上源码核对。 */
        args: [
          BigInt(artwork.id),
          outcome === 'bull' ? 0 : 1,
          value,
        ],
        value,
      });

      /**
       * 实际场景：若为 ERC20 抵押应使用 `approve` + `value: 0n`；
       * 「此数据应从合约 IERC20(usdc)` 计价逻辑替换」。
       */
      setTxHash(h);
      push(`已提交交易哈希：${explorerBase}${h}`);
    } catch (e) {
      const msg =
        typeof e === 'object' &&
        e &&
        'shortMessage' in e &&
        typeof (e as { shortMessage?: string }).shortMessage === 'string'
          ? (e as { shortMessage: string }).shortMessage
          : String(e ?? '未知错误');

      push(
        msg.toLowerCase().includes('reject')
          ? '您在钱包取消了本次操作。'
          : msg.includes('insufficient funds') || msg.toLowerCase().includes('gas')
            ? '余额不足以支付下注或手续费，请参考页面提示先到 Discord 水龙头领取 MON。'
            : `写入失败（可能合约未部署或未升级 ABI）：${msg.slice(0, 180)}`,
        'error',
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-[11px] text-neutral-500">
        <Link to="/" className="text-accent hover:text-fuchsia-200">
          ← 返回列表
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2.1fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-xl shadow-purple-950/40">
            <div className="relative aspect-video">
              <img
                src={artwork.heroImage}
                alt={artwork.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-neutral-950/70 px-3 py-1 text-[11px] text-accent shadow-lg">
                {predictionOpen ? '预测进行中 MOCK' : '已结算 MOCK'}
              </span>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5">
            <div>
              <h1 className="text-xl font-semibold text-white md:text-2xl">{artwork.title}</h1>
              <p className="mt-1 text-xs text-neutral-400">
                {artwork.artist} · {artwork.year}
              </p>
            </div>
            <p className="text-sm text-neutral-300">{artwork.medium}</p>
            <div>
              <div className="text-xs font-semibold text-neutral-200">传承记录</div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-neutral-400">
                {artwork.provenance.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 text-xs text-neutral-300 md:grid-cols-2">
              <div>
                <span className="text-neutral-500">鉴定机构</span>
                <div className="mt-1 text-sm font-medium text-neutral-100">{artwork.appraiserOrg}</div>
              </div>
              <div>
                <span className="text-neutral-500">托管机构</span>
                <div className="mt-1 text-sm font-medium text-neutral-100">{artwork.custodian}</div>
              </div>
              <div>
                <span className="text-neutral-500">当前估值快照</span>
                <div className="mt-1 text-accent">{formatUsd(artwork.appraisalValueUsd)}</div>
                <div className="mt-1 text-[11px] text-neutral-500">
                  预测窗口结束时间：
                  <span className="text-neutral-200">
                    {new Date(artwork.predictionEndsAt).toLocaleString()}
                  </span>
                  {predictionOpen ? ` · 还剩 ${countdownLabel(artwork.predictionEndsAt, now)}` : null}
                </div>
              </div>
            </div>
            <details className="rounded-2xl border border-white/10 bg-neutral-950/40 p-3 text-[11px] text-neutral-400">
              <summary className="cursor-pointer select-none text-neutral-300">水龙头说明</summary>
              <p className="mt-2 leading-relaxed">{FAUCET_INFO}</p>
            </details>
          </div>
          {!predictionOpen ? <SettlementBlock artworkId={artwork.id} /> : null}

          <div className="space-y-3 rounded-3xl border border-white/10 bg-neutral-950/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">看涨代币价格迷你走势（演示）</h3>
              <div className="flex gap-2 text-[11px]">
                {(['7d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`rounded-full px-3 py-1 transition ${
                      range === r
                        ? 'bg-accent text-[#17081f]'
                        : 'border border-white/15 text-neutral-300 hover:border-accent/45'
                    }`}
                  >
                    {r === '7d' ? '最近 7 天' : '最近 30 天'}
                  </button>
                ))}
              </div>
            </div>
            <PriceMiniChart data={chartData} />
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-fuchsia-500/15 to-transparent p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] text-neutral-400">实盘价格读数</div>
                <div className="mt-2 text-xl font-semibold text-white md:text-2xl">
                  看涨 {(ticker.snap.bullish * 100).toFixed(1)}%
                </div>
                <div className="mt-2 text-[11px] text-neutral-500">
                  看跌份额等价约 {(ticker.snap.bearish * 100).toFixed(1)}% · 应由 `getPoolTotals` +
                  CFMM 推导
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  ticker.manualRefresh();
                  push('已触发本地占位刷新 · 生产中请改为 `wagmi.invalidateQueries`。');
                }}
                className="rounded-2xl border border-white/20 bg-neutral-950/70 px-3 py-2 text-[11px] text-neutral-200 hover:border-accent/45"
              >
                手动刷新池子快照
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-neutral-200">
              <div className="rounded-2xl bg-black/35 p-3">
                <div className="text-neutral-400">看涨锁仓示意</div>
                <div className="mt-2 text-xl font-semibold text-emerald-300">{ticker.distribution.bullPct}%</div>
              </div>
              <div className="rounded-2xl bg-black/35 p-3">
                <div className="text-neutral-400">看跌锁仓示意</div>
                <div className="mt-2 text-xl font-semibold text-rose-300">{ticker.distribution.bearPct}%</div>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl bg-black/30 p-3 text-[11px] text-neutral-300">
              <div className="flex items-center justify-between">
                <span>总锁仓价值（占位 wei）</span>
                <span className="font-semibold text-white">
                  {Number(formatEther(BigInt(artwork.totalLockedMonWei))).toFixed(1)} MON
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-neutral-900">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-accent"
                  style={{ width: `${ticker.distribution.bullPct}%` }}
                />
              </div>
              <div className="text-[11px] text-neutral-500">
                「REPLACE_WITH_POOL_TVLAGG」：请以 `predictionMarket.getPoolTotals(artworkId)` 汇总 TVL，
                + 代币价格折算。
              </div>
              <div className="rounded-xl border border-dashed border-accent/35 bg-accent/5 px-2 py-1 text-[11px] text-neutral-400">
                自动轮询：每 15s 更新一次本地噪声曲线；切换到主网时请改为 wagmi/React Query{' '}
                <span className="text-accent">`refetchInterval: 15000`</span> 对接真实 RPC。
              </div>
            </div>

            <div className="space-y-3 rounded-3xl bg-black/50 p-3">
              <div className="text-xs font-semibold text-neutral-100">下注面板（MON · payable 演示）</div>
              <div className="flex gap-2 rounded-2xl bg-neutral-900/80 p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setOutcome('bull')}
                  className={`flex-1 rounded-xl py-2 font-medium ${
                    outcome === 'bull' ? 'bg-emerald-500 text-emerald-950' : 'text-neutral-400'
                  }`}
                >
                  看涨
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome('bear')}
                  className={`flex-1 rounded-xl py-2 font-medium ${
                    outcome === 'bear' ? 'bg-rose-500 text-rose-50' : 'text-neutral-400'
                  }`}
                >
                  看跌
                </button>
              </div>
              <label className="flex flex-col gap-1 text-[11px] text-neutral-400">
                输入 MON（18 位小数）
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none ring-0 focus:border-accent/60"
                />
              </label>
              {!isConfiguredMarketAddress(PREDICTION_MARKET_ADDRESS) ? (
                <div className="rounded-2xl border border-yellow-700/35 bg-yellow-950/55 px-3 py-2 text-[11px] text-yellow-100">
                  当前未检测到有效合约地址：<code className="font-mono">VITE_PREDICTION_MARKET_ADDRESS</code>。
                  UI 可先联调排版与 ABI；部署后填入即可发起真实写入。
                </div>
              ) : null}

              {(isPending || confirming) && (
                <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] text-accent">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-accent" />
                    {isPending ? '等待钱包签名并广播……' : '交易已发送，确认中…'}
                  </div>
                </div>
              )}

              {txHash ? (
                <div className="space-y-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-neutral-300">
                  <div>
                    Monad 浏览器链接：{' '}
                    <a
                      href={`${explorerBase}${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all font-mono text-accent underline underline-offset-2"
                    >
                      {txHash.slice(0, 10)}…{txHash.slice(-8)}
                    </a>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled={!predictionOpen || isPending || confirming}
                onClick={() => void onTrade()}
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-900/70 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-neutral-700"
              >
                {predictionOpen ? '发起链上买入（占位 ABI）' : '窗口已关闭'}
              </button>
              <div className="text-[11px] text-neutral-500">
                成功后请依赖 `predictionMarket.buyOutcome(artworkId, outcomeEnum, amount)` 事件回填持仓列表。
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-3 rounded-3xl border border-white/10 bg-neutral-950/40 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">历史预测记录（mock events）</h3>
            <p className="mt-1 text-[11px] text-neutral-500">
              列表数据来自前端本地数组；生产中请分页调用 `ethers.getLogs` / The Graph subgraph。
            </p>
          </div>
        </div>
        <HistoryTable rows={MOCK_PREDICTION_EVENTS_BY_ART[artwork.id] ?? []} />
      </section>
    </div>
  );
}
