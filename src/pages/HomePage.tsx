import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HOMEPAGE_FEATURED_ARTWORK_ID, MOCK_ARTWORKS, type Artwork } from '@/mock/artworks';
import { countdownLabel, formatUsd } from '@/lib/format';
import { formatEther } from 'viem';

type SortMode = 'tvl' | 'participants' | 'ending';

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
  {
    title: '柴窑龙舟福童枕 2亿港币档位',
    volume: '$3.8M 今日',
    heatChange: 27,
  },
  {
    title: '倪瓒《江亭山色图》1.6亿港币档位',
    volume: '$2.1M 今日',
    heatChange: 16,
  },
  {
    title: '毕加索《女子半身像》1.9亿港币档位',
    volume: '$1.9M 今日',
    heatChange: 22,
  },
  {
    title: '傅抱石《竹林七贤》6000万港币档位',
    volume: '$740K 今日',
    heatChange: -6,
  },
  {
    title: '几何寂静 No.07 700万港币档位',
    volume: '$390K 今日',
    heatChange: 11,
  },
  {
    title: '俪人行长卷 3000万港币档位',
    volume: '$1.4M 今日',
    heatChange: 19,
  },
  {
    title: '柴窑龙舟福童枕 3亿港币档位',
    volume: '$960K 今日',
    heatChange: -8,
  },
  {
    title: '雾与海·单色摄影 500万港币档位',
    volume: '$260K 今日',
    heatChange: 7,
  },
  {
    title: '倪瓒《江亭山色图》2亿港币档位',
    volume: '$680K 今日',
    heatChange: 13,
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
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-3xl border border-accent/35 bg-gradient-to-br from-accent/25 via-neutral-950/90 to-neutral-950 shadow-xl shadow-accent/15 transition hover:border-accent/55"
    >
      <div className="relative aspect-[16/9] min-h-[260px]">
        <img
          src={artwork.heroImage}
          alt={artwork.title}
          loading="eager"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950/75 via-transparent to-transparent md:bg-gradient-to-t md:from-neutral-950/80 md:via-transparent" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-[180px]">
          <h2 className="text-xl font-semibold leading-tight text-white md:text-2xl">{artwork.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            <span className="text-neutral-500">总交易量 </span>
            <span className="font-semibold text-white">{formatUsd(totalVolume)}</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            <span className="text-neutral-500">参与人数 </span>
            <span className="font-semibold text-emerald-300">{participantCount.toLocaleString('zh-CN')} 人</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            <span className="text-neutral-500">{ended ? '状态 ' : '截止倒计时 '}</span>
            <span className="font-semibold text-accent">
              {ended ? '已结束 · 查看结算' : countdownLabel(artwork.predictionEndsAt, now)}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center rounded-2xl bg-accent px-4 py-2.5 text-xs font-semibold text-[#14061f] transition group-hover:brightness-110">
          进入预测盘口 →
        </span>
      </div>
    </Link>
  );
}

function FeaturedInfoCards() {
  return (
    <div className="lg:h-full">
      <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">热门预测</h3>
          <span className="text-lg text-neutral-500">›</span>
        </div>
        <div className="mt-3 space-y-2">
          {FEATURED_HOT_TOPICS.map((item, idx) => (
            <div key={item.title} className="grid grid-cols-[24px_minmax(0,1fr)_96px] items-center gap-3">
              <div className="text-base font-semibold text-neutral-600">{idx + 1}</div>
              <div className="truncate text-sm font-semibold text-neutral-300">{item.title}</div>
              <div className="text-right text-xs">
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

function HomeFooter() {
  const contactLinks = [
    { label: 'Email', icon: '✉' },
    { label: 'X', icon: '𝕏' },
    { label: 'Instagram', icon: '◎' },
    { label: 'Discord', icon: '☁' },
    { label: 'TikTok', icon: '♪' },
  ];
  const policyLinks = ['隐私', '使用条款', '市场诚信', '帮助中心', '文档'];

  return (
    <footer className="border-t border-white/10 pt-6 text-[11px] text-neutral-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {contactLinks.map((item) => (
            <a key={item.label} href="#" className="inline-flex items-center gap-1.5 transition hover:text-accent">
              <span className="text-sm text-neutral-300">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 md:justify-center">
          <span className="font-medium text-neutral-300">CBID Market © 2026</span>
          {policyLinks.map((label) => (
            <a key={label} href="#" className="transition hover:text-accent">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:justify-end">
          <span>语言</span>
          <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-neutral-300 hover:border-accent/45">
            中文
          </button>
        </div>
      </div>
    </footer>
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

      <HomeFooter />
    </div>
  );
}
