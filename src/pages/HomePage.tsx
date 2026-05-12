import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HOMEPAGE_FEATURED_ARTWORK_ID, MOCK_ARTWORKS, type Artwork } from '@/mock/artworks';
import { countdownLabel, formatUsd } from '@/lib/format';
import { formatEther } from 'viem';

type SortMode = 'tvl' | 'participants' | 'ending';

const FEATURED_BREAKING_NEWS = [
  {
    title: '俪人行长卷最终成交价会达到 5000万港币吗？',
    probability: 18,
    change: 6,
  },
  {
    title: '俪人行长卷最终成交价会达到 3000万港币吗？',
    probability: 49,
    change: 12,
  },
  {
    title: '俪人行长卷最终成交价会低于 2000万港币吗？',
    probability: 28,
    change: -7,
  },
];

const FEATURED_HOT_TOPICS = [
  {
    title: '3000万港币档位',
    volume: '$4.2M 今日',
    heatChange: 31,
  },
  {
    title: '香港中信拍卖行夜场',
    volume: '$860K 今日',
    heatChange: 18,
  },
  {
    title: '长卷类作品成交价',
    volume: '$520K 今日',
    heatChange: 9,
  },
  {
    title: '5000万港币突破概率',
    volume: '$410K 今日',
    heatChange: -5,
  },
  {
    title: '书画板块回暖',
    volume: '$280K 今日',
    heatChange: 14,
  },
];

function participantCountFor(artwork: Artwork): number {
  const totalVolume = Number(formatEther(BigInt(artwork.totalLockedMonWei)));
  return Math.max(120, Math.round(totalVolume / 7.1));
}

function sortArtworks(rows: readonly Artwork[], mode: SortMode): Artwork[] {
  const next = [...rows];
  if (mode === 'tvl')
    next.sort((a, b) => Number(b.totalLockedMonWei) - Number(a.totalLockedMonWei));
  else if (mode === 'participants') next.sort((a, b) => participantCountFor(b) - participantCountFor(a));
  else if (mode === 'ending') next.sort((a, b) => a.predictionEndsAt - b.predictionEndsAt);
  return next;
}

/** 首页首屏「当前最热」大卡；独立于下方列表卡片。 */
function HotFeaturedBanner({ artwork, now }: { artwork: Artwork; now: number }) {
  const ended = artwork.predictionEndsAt <= now;
  const totalVolume = Number(formatEther(BigInt(artwork.totalLockedMonWei)));
  const participantCount = participantCountFor(artwork);
  return (
    <Link
      to={`/art/${artwork.id}`}
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-3xl border border-accent/35 bg-gradient-to-br from-accent/25 via-neutral-950/90 to-neutral-950 shadow-xl shadow-accent/15 transition hover:border-accent/55 md:grid md:min-h-[320px] md:grid-cols-[1.35fr_minmax(0,1fr)]"
    >
      <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[320px]">
        <img
          src={artwork.heroImage}
          alt={artwork.title}
          loading="eager"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950/75 via-transparent to-transparent md:bg-gradient-to-t md:from-neutral-950/80 md:via-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent backdrop-blur">
          HOT · 当前最热
        </span>
      </div>
      <div className="flex flex-col justify-between gap-4 p-5 md:p-8">
        <div>
          <h2 className="text-xl font-semibold leading-tight text-white md:text-3xl">{artwork.title}</h2>
          <p className="mt-2 text-sm text-neutral-400">{artwork.artist}</p>
          <p className="mt-3 line-clamp-2 text-sm text-neutral-500">{artwork.medium}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur">
            <div className="text-neutral-500">总交易量</div>
            <div className="mt-1 text-sm font-semibold text-white">{formatUsd(totalVolume)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur">
            <div className="text-neutral-500">参与人数</div>
            <div className="mt-1 text-sm font-semibold text-emerald-300">
              {participantCount.toLocaleString('zh-CN')} 人
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur sm:col-span-1">
            <div className="text-neutral-500">{ended ? '状态' : '预测截止倒计时'}</div>
            <div className="mt-1 text-sm font-semibold text-accent">
              {ended ? '已结束 · 查看结算' : countdownLabel(artwork.predictionEndsAt, now)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <span className="inline-flex items-center rounded-2xl bg-accent px-4 py-2.5 text-xs font-semibold text-[#14061f] transition group-hover:brightness-110">
            进入预测盘口 →
          </span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedInfoCards() {
  return (
    <div className="grid gap-3 lg:h-full lg:grid-rows-2">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">突发新闻</h3>
          <span className="text-lg text-neutral-500">›</span>
        </div>
        <div className="mt-3 divide-y divide-white/10">
          {FEATURED_BREAKING_NEWS.map((item, idx) => (
            <div key={item.title} className="grid grid-cols-[24px_minmax(0,1fr)_64px] items-center gap-3 py-2.5">
              <div className="text-sm font-semibold text-neutral-600">{idx + 1}</div>
              <div className="text-xs font-semibold leading-relaxed text-neutral-100">{item.title}</div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">{item.probability}%</div>
                <div className={item.change >= 0 ? 'text-[11px] font-semibold text-emerald-300' : 'text-[11px] font-semibold text-rose-300'}>
                  {item.change >= 0 ? '↗' : '↘'} {Math.abs(item.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">热门话题</h3>
          <span className="text-lg text-neutral-500">›</span>
        </div>
        <div className="mt-3 space-y-2">
          {FEATURED_HOT_TOPICS.map((item, idx) => (
            <div key={item.title} className="grid grid-cols-[24px_minmax(0,1fr)_96px] items-center gap-3">
              <div className="text-sm font-semibold text-neutral-600">{idx + 1}</div>
              <div className="truncate text-xs font-semibold text-neutral-100">{item.title}</div>
              <div className="text-right text-[11px]">
                <div className="font-semibold text-neutral-300">{item.volume}</div>
                <div className={item.heatChange >= 0 ? 'font-semibold text-emerald-300' : 'font-semibold text-rose-300'}>
                  {item.heatChange >= 0 ? '↗' : '↘'} {Math.abs(item.heatChange)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtCard({ artwork, now }: { artwork: Artwork; now: number }) {
  const ended = artwork.predictionEndsAt <= now;
  const previewTiers = artwork.priceTiers.slice(0, 2);
  return (
    <Link
      to={`/art/${artwork.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-lg shadow-purple-950/30 transition hover:-translate-y-[1px] hover:border-accent/35"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
        <img
          src={artwork.thumbnail}
          alt={artwork.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-neutral-950/70 px-2 py-1 text-[10px] uppercase tracking-wide text-accent">
          RWA ART
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-white">{artwork.title}</h3>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-xs text-neutral-400">作者：{artwork.artist}</p>
            <p className="shrink-0 text-[11px] text-neutral-400">
              拍卖行：
              <span className="rounded-full border border-accent/35 bg-accent-soft px-2 py-0.5 font-semibold text-accent">
                {artwork.auctionHouse}
              </span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-neutral-300">
          <div className="col-span-2 space-y-1">
            {previewTiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="truncate text-neutral-300">{tier.label}</span>
                <span className="shrink-0 font-semibold text-accent">{tier.probability}%</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-neutral-500">{ended ? '状态' : '截止倒计时'}</div>
            <div className="mt-1 font-semibold text-white">
              {ended ? (
                <span className="text-xs text-accent">预测已结束 · 可看结算</span>
              ) : (
                countdownLabel(artwork.predictionEndsAt, now)
              )}
            </div>
          </div>
          <div>
            <div className="text-neutral-500">总交易量</div>
            <div className="mt-1 font-semibold text-accent">
              {formatUsd(Number(formatEther(BigInt(artwork.totalLockedMonWei))))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const [sort, setSort] = useState<SortMode>('tvl');
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const featured = useMemo(
    () => MOCK_ARTWORKS.find((a) => a.id === HOMEPAGE_FEATURED_ARTWORK_ID) ?? MOCK_ARTWORKS[0],
    [],
  );

  const sortedOthers = useMemo(() => {
    const rest = MOCK_ARTWORKS.filter((a) => a.id !== featured.id);
    return sortArtworks(rest, sort);
  }, [featured.id, sort]);

  return (
    <div className="space-y-10">
      {/* 第一板块：当前最热 */}
      <section aria-labelledby="featured-heading" className="space-y-3">
        <h2 id="featured-heading" className="text-sm font-semibold text-neutral-200">
          当前最热的艺术品
        </h2>
        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <HotFeaturedBanner artwork={featured} now={tick} />
          <FeaturedInfoCards />
        </div>
      </section>

      {/* 第二板块：其他艺术品 */}
      <section aria-labelledby="other-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="other-heading" className="text-sm font-semibold text-neutral-200">
            所有艺术品盘口
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
          <span className="text-xs text-neutral-500">本列表排序</span>
          {(
            [
              ['tvl', '总交易量 $'],
              ['participants', '参与人数最多'],
              ['ending', '结束时间最近'],
            ] as const
          ).map(([k, lab]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                sort === k
                  ? 'bg-accent text-[#14061f]'
                  : 'border border-white/10 bg-transparent text-neutral-300 hover:border-accent/35'
              }`}
            >
              {lab}
            </button>
          ))}
        </div>

        {sortedOthers.length === 0 ? (
          <p className="text-sm text-neutral-500">暂无其他艺术品。</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedOthers.map((a) => (
              <ArtCard key={a.id} artwork={a} now={tick} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
