import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';
import { MOCK_ARTWORKS } from '@/mock/artworks';
import {
  MOCK_AUCTION_PRICE_HISTORY_BY_ARTWORK,
  type AuctionPricePoint,
} from '@/mock/priceHistory';
import { MOCK_MARKET_TABS_BY_ARTWORK, type MarketTabData } from '@/mock/marketTabs';
import { formatUsd, shortAddress } from '@/lib/format';
import { PriceMiniChart } from '@/components/PriceMiniChart';
import { predictionMarketAbi } from '@/abi/predictionMarket';
import { useToast } from '@/context/Toast';
import { PREDICTION_MARKET_ADDRESS, isConfiguredMarketAddress } from '@/config/contracts';
import { usePoolTicker } from '@/hooks/usePoolTicker';
import { MONAD_EXPLORER_TX, monadTestnet } from '@/lib/monad';
import { useTxReceiptFeedback } from '@/hooks/useTxFeedback';

function formatHkd(value: number): string {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDollarAmount(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

type MarketInfoTab = 'comments' | 'holders' | 'positions' | 'activity';

const MARKET_INFO_TABS: Array<{ id: MarketInfoTab; label: string }> = [
  { id: 'comments', label: '评论' },
  { id: 'holders', label: '顶级持仓者' },
  { id: 'positions', label: '持仓' },
  { id: 'activity', label: '动态' },
];

function sideLabel(side: 'yes' | 'no') {
  return side === 'yes' ? '是' : '否';
}

function sideClass(side: 'yes' | 'no') {
  return side === 'yes' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300';
}

function MarketInfoTabs({
  activeTab,
  data,
  onTabChange,
}: {
  activeTab: MarketInfoTab;
  data: MarketTabData;
  onTabChange: (tab: MarketInfoTab) => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-3">
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-neutral-950/75 p-1 text-[11px]">
        {MARKET_INFO_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`shrink-0 rounded-xl px-3 py-2 font-semibold transition ${
              activeTab === tab.id ? 'bg-white text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {activeTab === 'comments' ? (
          <div className="space-y-3">
            {data.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{comment.user}</span>
                      <span className="text-neutral-500">{comment.handle}</span>
                      {comment.badge ? (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                          {comment.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-300">{comment.text}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-neutral-600">{comment.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === 'holders' ? (
          <div className="space-y-2">
            {data.holders.map((holder, idx) => (
              <div
                key={holder.id}
                className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs"
              >
                <div className="text-center font-semibold text-neutral-500">#{idx + 1}</div>
                <div className="min-w-0">
                  <div className="font-mono text-neutral-200">{shortAddress(holder.wallet)}</div>
                  <div className="mt-1 truncate text-[11px] text-neutral-500">{holder.tierLabel}</div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sideClass(holder.side)}`}>
                    {sideLabel(holder.side)}
                  </span>
                  <div className="mt-1 font-semibold text-white">{formatDollarAmount(holder.valueUsd)}</div>
                  <div className="text-[10px] text-neutral-500">{holder.shares.toLocaleString('zh-CN')} 份额</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === 'positions' ? (
          <div className="space-y-2">
            {data.positions.map((position) => (
              <div key={position.id} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{position.tierLabel}</div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                      均价 {position.avgPriceCents}¢ · {position.shares.toLocaleString('zh-CN')} 份额
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sideClass(position.side)}`}>
                    {sideLabel(position.side)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                  <span className="text-neutral-500">未实现盈亏</span>
                  <span className={position.pnlUsd >= 0 ? 'font-semibold text-emerald-300' : 'font-semibold text-rose-300'}>
                    {position.pnlUsd >= 0 ? '+' : ''}
                    {formatDollarAmount(position.pnlUsd)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === 'activity' ? (
          <div className="space-y-2">
            {data.activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-neutral-200">{shortAddress(item.wallet)}</div>
                    <div className="mt-1 truncate text-[11px] text-neutral-500">{item.tierLabel}</div>
                  </div>
                  <span className="shrink-0 text-[10px] text-neutral-600">{item.time}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">
                    {item.action}
                    <span className={`ml-1 rounded-full px-2 py-0.5 font-semibold ${sideClass(item.side)}`}>
                      {sideLabel(item.side)}
                    </span>
                  </span>
                  <span className="font-semibold text-white">
                    {formatDollarAmount(item.amountUsd)} · {item.priceCents}¢
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
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

  const [selectedTierId, setSelectedTierId] = useState('hkd-5000w');
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('50');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [activeInfoTab, setActiveInfoTab] = useState<MarketInfoTab>('comments');

  const { address, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const confirming = useTxReceiptFeedback(txHash).confirming;

  const ticker = usePoolTicker(poolSeed);

  const chartData: AuctionPricePoint[] = useMemo(() => {
    if (!artworkCandidate) return [];
    return MOCK_AUCTION_PRICE_HISTORY_BY_ARTWORK[artworkCandidate.id] ?? [];
  }, [artworkCandidate]);

  const marketTabData = useMemo(() => {
    if (!artworkCandidate) return MOCK_MARKET_TABS_BY_ARTWORK['1'];
    return MOCK_MARKET_TABS_BY_ARTWORK[artworkCandidate.id] ?? MOCK_MARKET_TABS_BY_ARTWORK['1'];
  }, [artworkCandidate]);

  if (!id || !artworkCandidate) {
    return <Navigate to="/" replace />;
  }

  const artwork = artworkCandidate;

  const predictionOpen = artwork.predictionEndsAt > now;
  const explorerBase = MONAD_EXPLORER_TX;
  const totalVolumeUsd = Number(formatEther(BigInt(artwork.totalLockedMonWei)));
  const marketRows = artwork.priceTiers;
  const selectedTier = marketRows.find((tier) => tier.id === selectedTierId) ?? marketRows[0]!;

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
      push('请输入合法的金额（例如 50）。');
      return;
    }

    if (value <= 0n) {
      push('金额必须大于 0。');
      return;
    }

    if (!isConfiguredMarketAddress(PREDICTION_MARKET_ADDRESS)) {
      push('尚未配置合约地址：`VITE_PREDICTION_MARKET_ADDRESS`，当前仅可查看页面内容。');
      return;
    }

    try {
      setTxHash(undefined);
      push('等待钱包弹出签名面板…');
      const tierIndex = Math.max(
        0,
        artwork.priceTiers.findIndex((tier) => tier.id === selectedTier.id),
      );

      const h = await writeContractAsync({
        account: address,
        address: PREDICTION_MARKET_ADDRESS,
        abi: predictionMarketAbi,
        chainId: monadTestnet.id,
        functionName: 'buyOutcome',
        /** outcomeCode 为占位：tierIndex * 2 + side（是=0，否=1）；实盘请按合约枚举定义对齐。 */
        args: [
          BigInt(artwork.id),
          tierIndex * 2 + (selectedSide === 'yes' ? 0 : 1),
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
            ? '余额不足以支付交易或手续费，请检查钱包余额。'
            : `写入失败（可能合约未部署或未升级 ABI）：${msg.slice(0, 180)}`,
        'error',
      );
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex text-[11px] text-accent hover:text-fuchsia-200">
        ← 返回艺术品市场
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <main className="space-y-5">
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-purple-950/25 md:p-6">
            <div className="flex flex-wrap items-start gap-4">
              <img
                src={artwork.thumbnail}
                alt={artwork.title}
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10 md:h-20 md:w-20"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                  <span className="rounded-full border border-white/10 px-2 py-1">艺术品 RWA</span>
                  <span>拍卖成交价预测</span>
                  <span>{artwork.auctionHouse}</span>
                </div>
                <h1 className="text-2xl font-semibold leading-tight text-white md:text-4xl">
                  {artwork.marketTitle}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-400">
                  <span>
                    {formatUsd(totalVolumeUsd)} <span className="text-neutral-500">交易量</span>
                  </span>
                  <span>拍卖日（香港时间）：{artwork.auctionDateHkt}</span>
                  <span>预测截止时间：{artwork.predictionDeadlineHkt}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10">
              {marketRows.map((row) => {
                const isSelected = selectedTier.id === row.id;
                return (
                  <div
                    key={row.id}
                    className={`grid gap-3 p-4 transition md:grid-cols-[minmax(0,1fr)_90px_110px_110px] md:items-center ${
                      isSelected
                        ? 'bg-accent-soft ring-1 ring-inset ring-accent/45'
                        : 'bg-neutral-950/40 hover:bg-white/[0.04]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTierId(row.id);
                        setSelectedSide('yes');
                      }}
                      className="min-w-0 text-left"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="truncate text-sm font-medium text-white">{row.label}</div>
                        {isSelected ? (
                          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-[#14061f]">
                            当前预测
                          </span>
                        ) : null}
                      </div>
                      <div className={`mt-1 text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        阈值：{formatHkd(row.thresholdHkd)} · 拍卖行：{artwork.auctionHouse}
                      </div>
                    </button>
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-semibold text-white">{row.probability}%</div>
                      <div className="text-[10px] text-neutral-500">当前概率</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTierId(row.id);
                        setSelectedSide('yes');
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold hover:bg-emerald-500/25 ${
                        isSelected && selectedSide === 'yes'
                          ? 'bg-emerald-500 text-emerald-950'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      买入 是 {row.yesPriceCents}¢
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTierId(row.id);
                        setSelectedSide('no');
                      }}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold hover:bg-rose-500/25 ${
                        isSelected && selectedSide === 'no'
                          ? 'bg-rose-500 text-rose-50'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      买入 否 {row.noPriceCents}¢
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-500">
              <span>预测截止：{artwork.predictionDeadlineHkt}</span>
              <button
                type="button"
                onClick={() => {
                  ticker.manualRefresh();
                  push('已刷新价格。');
                }}
                className="rounded-full border border-white/15 px-3 py-1.5 text-neutral-300 hover:border-accent/45"
              >
                手动刷新价格
              </button>
            </div>
          </section>

          <section className="space-y-4 rounded-[28px] border border-white/10 bg-neutral-950/40 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">历史拍卖成交价</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-neutral-400">
                5 次成交
              </span>
            </div>
            <PriceMiniChart data={chartData} />
          </section>

          <section className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold text-white">规则</h2>
              <p className="text-sm leading-relaxed text-neutral-300">
                本市场预测 {artwork.title} 在 {artwork.auctionHouse} 于香港时间
                {artwork.auctionDateHkt} 举行拍卖时的最终成交价。每个价格档位独立结算：
                若最终成交价大于等于该档阈值，则该档「是」份额胜出；否则「否」份额胜出。
              </p>
              <p className="text-xs leading-relaxed text-neutral-500">
                预测截止时间为 {artwork.predictionDeadlineHkt}。主要结算来源为
                {artwork.auctionHouse} 官方成交公告、{artwork.appraiserOrg} 与链上托管收据。
                实盘请将规则文本、预言机地址和最终判定事件写入合约或 indexer。
              </p>
            </div>
            <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold text-white">盘口背景</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-neutral-500">拍卖行</div>
                  <div className="mt-1 font-semibold text-white">{artwork.auctionHouse}</div>
                </div>
                <div>
                  <div className="text-neutral-500">拍卖日期</div>
                  <div className="mt-1 font-semibold text-white">{artwork.auctionDateHkt}</div>
                </div>
                <div>
                  <div className="text-neutral-500">预测截止</div>
                  <div className="mt-1 font-semibold text-white">{artwork.predictionDeadlineHkt}</div>
                </div>
                <div>
                  <div className="text-neutral-500">参考估值</div>
                  <div className="mt-1 font-semibold text-white">{formatUsd(artwork.appraisalValueUsd)}</div>
                </div>
              </div>
              <a
                href={artwork.detailUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-3 text-xs transition hover:border-accent/60 hover:bg-accent/15"
              >
                <span>
                  <span className="block font-semibold text-white">艺术品详情介绍</span>
                  <span className="mt-1 block text-neutral-400">查看作品介绍、拍卖说明与相关资料</span>
                </span>
                <span className="shrink-0 font-semibold text-accent">打开 →</span>
              </a>
            </div>
          </section>

          <MarketInfoTabs
            activeTab={activeInfoTab}
            data={marketTabData}
            onTabChange={setActiveInfoTab}
          />
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-purple-950/20">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">交易</h2>
              <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-neutral-400">
                $ 交易
              </span>
            </div>
            <div className="mt-4 rounded-2xl border border-accent/35 bg-accent-soft px-4 py-3 text-xs text-neutral-300">
              <div className="text-[11px] font-semibold text-accent">当前档位</div>
              <div className="mt-1 text-base font-semibold leading-snug text-white">{selectedTier.label}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-neutral-950/70 p-1 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedSide('yes')}
                className={`rounded-xl py-2 font-semibold ${
                  selectedSide === 'yes' ? 'bg-emerald-500 text-emerald-950' : 'text-neutral-400'
                }`}
              >
                是 {selectedTier.yesPriceCents}¢
              </button>
              <button
                type="button"
                onClick={() => setSelectedSide('no')}
                className={`rounded-xl py-2 font-semibold ${
                  selectedSide === 'no' ? 'bg-rose-500 text-rose-50' : 'text-neutral-400'
                }`}
              >
                否 {selectedTier.noPriceCents}¢
              </button>
            </div>
            <label className="mt-4 flex flex-col gap-1 text-[11px] text-neutral-400">
              金额
              <div className="flex items-center rounded-2xl border border-white/10 bg-neutral-950 px-3 py-2 focus-within:border-accent/60">
                <span className="mr-2 text-xs font-semibold text-neutral-300">$</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                />
              </div>
            </label>

            {!isConfiguredMarketAddress(PREDICTION_MARKET_ADDRESS) ? (
              <div className="mt-3 rounded-2xl border border-yellow-700/35 bg-yellow-950/55 px-3 py-2 text-[11px] text-yellow-100">
                当前未检测到有效合约地址：<code className="font-mono">VITE_PREDICTION_MARKET_ADDRESS</code>。
              </div>
            ) : null}

            {(isPending || confirming) && (
              <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] text-accent">
                {isPending ? '等待钱包签名并广播……' : '交易已发送，确认中…'}
              </div>
            )}

            {txHash ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-neutral-300">
                Monad 浏览器：{' '}
                <a
                  href={`${explorerBase}${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-accent underline underline-offset-2"
                >
                  {txHash.slice(0, 10)}…{txHash.slice(-8)}
                </a>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!predictionOpen || isPending || confirming}
              onClick={() => void onTrade()}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-900/70 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-neutral-700"
            >
              {predictionOpen ? '交易' : '窗口已关闭'}
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              签名后显示哈希并等待 Monad Testnet 确认；合约方法为 `buyOutcome`。
            </p>
          </div>

        </aside>
      </div>
    </div>
  );
}
