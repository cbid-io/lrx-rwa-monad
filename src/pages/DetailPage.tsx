import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { formatEther, formatUnits, maxUint256, parseUnits } from 'viem';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import { MOCK_ARTWORKS } from '@/mock/artworks';
import {
  MOCK_AUCTION_PRICE_HISTORY_BY_ARTWORK,
  type AuctionPricePoint,
} from '@/mock/priceHistory';
import { MOCK_MARKET_TABS_BY_ARTWORK, type MarketTabData } from '@/mock/marketTabs';
import { formatUsd, shortAddress } from '@/lib/format';
import { PriceMiniChart } from '@/components/PriceMiniChart';
import { useToast } from '@/context/Toast';
import {
  PREDICTION_MARKET_ADDRESS,
  TEST_USDC_ADDRESS,
  isConfiguredMarketAddress,
} from '@/config/contracts';
import { erc20Abi } from '@/abi/erc20';
import { predictionMarketAbi } from '@/abi/predictionMarket';
import { erc20DecimalsToParseExponent } from '@/lib/erc20Decimals';
import { erc20ApproveWriteArgs } from '@/lib/erc20Tx';
import { PREDICTION_MARKET_ID_OVERRIDE } from '@/config/predictionMarket';
import { resolvePredictionMarketId } from '@/lib/predictionMarketTx';
import { SUBGRAPH_URL, isSubgraphConfigured } from '@/config/subgraph';
import { useMarketBetTotalsWei } from '@/hooks/useMarketBetTotals';
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
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient({ chainId: monadTestnet.id });
  const { writeContractAsync, isPending } = useWriteContract();
  const queryClient = useQueryClient();
  const { confirming, receipt } = useTxReceiptFeedback(txHash);

  const usdcConfigured = isConfiguredMarketAddress(TEST_USDC_ADDRESS);
  const marketConfigured = isConfiguredMarketAddress(PREDICTION_MARKET_ADDRESS);

  const { data: tokenDecimals } = useReadContract({
    address: usdcConfigured ? TEST_USDC_ADDRESS : undefined,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: monadTestnet.id,
    query: { enabled: usdcConfigured },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TEST_USDC_ADDRESS,
    abi: erc20Abi,
    chainId: monadTestnet.id,
    functionName: 'allowance',
    args:
      address && marketConfigured && usdcConfigured
        ? [address, PREDICTION_MARKET_ADDRESS]
        : undefined,
    query: {
      enabled: Boolean(address && marketConfigured && usdcConfigured),
    },
  });

  const { data: chainMarketCount } = useReadContract({
    address: marketConfigured ? PREDICTION_MARKET_ADDRESS : undefined,
    abi: predictionMarketAbi,
    chainId: monadTestnet.id,
    functionName: 'marketCount',
    query: { enabled: marketConfigured },
  });

  const ticker = usePoolTicker(poolSeed);

  const tierIndexActive = Math.max(
    0,
    artworkCandidate ? artworkCandidate.priceTiers.findIndex((t) => t.id === selectedTierId) : 0,
  );
  const selectedTierMeta = artworkCandidate?.priceTiers.find((t) => t.id === selectedTierId);
  const envOverridesMarketId = /^[0-9]+$/.test(PREDICTION_MARKET_ID_OVERRIDE);
  const tierOverridesMarketId = Boolean(selectedTierMeta?.chainMarketId?.trim());
  /** 避免在尚未拉到 `marketCount` 时退回占位公式（常见单笔部署 id 为 0，公式会得到 1000）。 */
  const predictionMarketMetaReady =
    !marketConfigured ||
    chainMarketCount !== undefined ||
    envOverridesMarketId ||
    tierOverridesMarketId;
  const subgraphMarketId =
    artworkCandidate !== undefined && predictionMarketMetaReady
      ? resolvePredictionMarketId({
          artworkId: artworkCandidate.id,
          tierIndex: tierIndexActive,
          tierChainMarketId: selectedTierMeta?.chainMarketId,
          chainMarketCount,
        })
      : undefined;
  const betTotalsQuery = useMarketBetTotalsWei(subgraphMarketId);

  useEffect(() => {
    if (receipt?.status === 'success') {
      void queryClient.invalidateQueries({ queryKey: ['predictionMarketBetTotals'] });
    }
  }, [queryClient, receipt?.status]);

  const chartData: AuctionPricePoint[] = useMemo(() => {
    if (!artworkCandidate) return [];
    return MOCK_AUCTION_PRICE_HISTORY_BY_ARTWORK[artworkCandidate.id] ?? [];
  }, [artworkCandidate]);

  const marketTabData = useMemo(() => {
    if (!artworkCandidate) return MOCK_MARKET_TABS_BY_ARTWORK['1'];
    return MOCK_MARKET_TABS_BY_ARTWORK[artworkCandidate.id] ?? MOCK_MARKET_TABS_BY_ARTWORK['1'];
  }, [artworkCandidate]);

  /**
   * 抵押代币最小单位指数：未配置 USDC 时用 18 仅占位；已配置则必须等链上 `decimals()` 返回后再解析金额，避免 USDC(6) 等精度错误。
   */
  const stakeParseExponent = useMemo(() => {
    if (!usdcConfigured) return 18;
    return erc20DecimalsToParseExponent(tokenDecimals);
  }, [usdcConfigured, tokenDecimals]);

  /** 用于主按钮文案：与链上 `allowance` 比较输入金额（最小单位）。 */
  const parsedStakeForLabel = useMemo(() => {
    if (stakeParseExponent === null) return undefined;
    try {
      const v = parseUnits(amount, stakeParseExponent);
      return v > 0n ? v : undefined;
    } catch {
      return undefined;
    }
  }, [amount, stakeParseExponent]);

  if (!id || !artworkCandidate) {
    return <Navigate to="/" replace />;
  }

  const artwork = artworkCandidate;

  const predictionOpen = artwork.predictionEndsAt > now;
  const explorerBase = MONAD_EXPLORER_TX;
  const totalVolumeUsd = Number(formatEther(BigInt(artwork.totalLockedMonWei)));
  const marketRows = artwork.priceTiers;
  const selectedTier = marketRows.find((tier) => tier.id === selectedTierId) ?? marketRows[0]!;

  const poolExponent = stakeParseExponent ?? 18;
  const showSubgraphPools = isSubgraphConfigured(SUBGRAPH_URL);
  let yesPoolDisplay = '—';
  let noPoolDisplay = '—';
  if (showSubgraphPools) {
    if (betTotalsQuery.isLoading) {
      yesPoolDisplay = noPoolDisplay = '加载中…';
    } else if (betTotalsQuery.error) {
      yesPoolDisplay = noPoolDisplay = '—';
    } else if (betTotalsQuery.data) {
      yesPoolDisplay = formatUsd(Number(formatUnits(betTotalsQuery.data.yesWei, poolExponent)));
      noPoolDisplay = formatUsd(Number(formatUnits(betTotalsQuery.data.noWei, poolExponent)));
    }
  }

  const onTrade = async () => {
    if (!address) {
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

    if (usdcConfigured && stakeParseExponent === null) {
      push('正在读取代币小数位，请稍后再试。');
      return;
    }

    const exponent = stakeParseExponent ?? 18;

    let stakeAmount: bigint;
    try {
      stakeAmount = parseUnits(amount, exponent);
    } catch {
      push('请输入合法的金额（例如 50）。');
      return;
    }

    if (stakeAmount <= 0n) {
      push('金额必须大于 0。');
      return;
    }

    if (!marketConfigured) {
      push('尚未配置合约地址：`VITE_PREDICTION_MARKET_ADDRESS`，当前仅可查看页面内容。');
      return;
    }

    if (!usdcConfigured) {
      push('尚未配置抵押代币：`VITE_TEST_USDC_ADDRESS`。');
      return;
    }

    if (marketConfigured && !predictionMarketMetaReady) {
      push('正在读取链上市场信息，请稍后再试。');
      return;
    }

    try {
      setTxHash(undefined);
      push('等待钱包弹出签名面板…');

      const { data: allowanceNow } = await refetchAllowance();
      const allowed = allowanceNow ?? 0n;

      if (allowed < stakeAmount) {
        push('当前授权不足，正在请求代币授权…');
        const approveReq = erc20ApproveWriteArgs({
          token: TEST_USDC_ADDRESS,
          spender: PREDICTION_MARKET_ADDRESS,
          amount: maxUint256,
        });
        const approveHash = await writeContractAsync({
          account: address,
          chainId: monadTestnet.id,
          ...approveReq,
        });
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        await refetchAllowance();
        push('授权已确认，提交预测交易…');
      }

      const tierIndex = Math.max(
        0,
        artwork.priceTiers.findIndex((tier) => tier.id === selectedTier.id),
      );
      const marketId = resolvePredictionMarketId({
        artworkId: artwork.id,
        tierIndex,
        tierChainMarketId: selectedTier.chainMarketId,
        chainMarketCount,
      });
      const betFunctionName = selectedSide === 'yes' ? 'betYes' : 'betNo';

      push(selectedSide === 'yes' ? '请在钱包中确认买入「是」…' : '请在钱包中确认买入「否」…');

      const h = await writeContractAsync({
        account: address,
        chainId: monadTestnet.id,
        address: PREDICTION_MARKET_ADDRESS,
        abi: predictionMarketAbi,
        functionName: betFunctionName,
        args: [marketId, stakeAmount],
      });

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

  const onTradeButtonClick = () => {
    if (!address) {
      openConnectModal?.();
      return;
    }
    void onTrade();
  };

  const purchaseExceedsAllowance =
    Boolean(address && marketConfigured && usdcConfigured && predictionOpen) &&
    allowance !== undefined &&
    parsedStakeForLabel !== undefined &&
    parsedStakeForLabel > allowance;

  const tradeButtonLabel = !address
    ? '连接钱包'
    : !predictionOpen
      ? '窗口已关闭'
      : !marketConfigured || !usdcConfigured
        ? '暂不可交易'
        : purchaseExceedsAllowance
          ? '授权'
          : '交易';

  const tradeButtonDisabled =
    (!!address && !predictionOpen) ||
    isPending ||
    confirming ||
    (!!address && (!marketConfigured || !usdcConfigured)) ||
    (!!address && marketConfigured && !predictionMarketMetaReady) ||
    (!!address && usdcConfigured && stakeParseExponent === null);

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex text-[11px] text-accent hover:text-fuchsia-200">
        ← 返回预测市场
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
                  <span className="rounded-full border border-accent/35 bg-accent-soft px-2 py-1 font-semibold text-accent">
                    {artwork.auctionHouse}
                  </span>
                </div>
                <h1 className="text-xl font-semibold leading-tight text-white md:text-2xl">
                  {artwork.marketTitle}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-400">
                  <span>
                    {formatUsd(totalVolumeUsd)} <span className="text-neutral-500">交易量</span>
                  </span>
                  <span>拍卖日（香港时间）：{artwork.auctionDateHkt}</span>
                  <span>预测截止时间（香港时间）：{artwork.predictionDeadlineHkt}</span>
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
                    {/* <div className="text-left md:text-right">
                      <div className="text-2xl font-semibold text-white">{row.probability}%</div>
                      <div className="text-[10px] text-neutral-500">当前概率</div>
                    </div> */}
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
                本市场预测 {artwork.title} 在{' '}
                <span className="font-semibold text-accent">{artwork.auctionHouse}</span> 于香港时间
                {artwork.auctionDateHkt} 举行拍卖时的最终成交价。每个价格档位独立结算：
                若最终成交价大于等于该档阈值，则该档「是」份额胜出；否则「否」份额胜出。
              </p>
              <p className="text-xs leading-relaxed text-neutral-500">
                预测截止时间为 {artwork.predictionDeadlineHkt}。主要结算来源为
                <span className="font-semibold text-accent">{artwork.auctionHouse}</span> 官方成交公告、
                {artwork.appraiserOrg} 与链上托管收据。
                实盘请将规则文本、预言机地址和最终判定事件写入合约或 indexer。
              </p>
            </div>
            <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
              <h2 className="text-sm font-semibold text-white">盘口背景</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-neutral-500">拍卖行</div>
                  <div className="mt-1 inline-flex rounded-full border border-accent/35 bg-accent-soft px-2.5 py-1 font-semibold text-accent">
                    {artwork.auctionHouse}
                  </div>
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

            {showSubgraphPools ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-950/55 px-4 py-3 text-xs">
                <div className="text-[11px] font-semibold text-neutral-400">盘口累计（抵押）</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-neutral-500">是</div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-emerald-300">{yesPoolDisplay}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-500">否</div>
                    <div className="mt-0.5 font-mono text-sm font-semibold text-rose-300">{noPoolDisplay}</div>
                  </div>
                </div>
              </div>
            ) : null}

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
              disabled={tradeButtonDisabled}
              onClick={onTradeButtonClick}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-900/70 transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-neutral-700"
            >
              {tradeButtonLabel}
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              金额按抵押代币链上小数位换算后与授权额度比较；选「是」或「否」将提交对应方向的下注。授权不足时会先完成授权再下单，交易哈希可在
              Monad Testnet 浏览器查看确认进度。
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">艺术品热点</h3>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-neutral-500">
                {marketTabData.hotNews.length} 条
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {marketTabData.hotNews.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs font-semibold leading-relaxed text-neutral-100">{item.title}</div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-neutral-500">
                    <span>{item.source}</span>
                    <span className="shrink-0">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
