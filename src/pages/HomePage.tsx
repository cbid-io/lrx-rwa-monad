import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HOMEPAGE_FEATURED_ARTWORK_ID, MOCK_ARTWORKS, type Artwork } from '@/mock/artworks';
import { countdownLabel, formatUsd } from '@/lib/format';
import { formatEther } from 'viem';

type SortMode = 'tvl' | 'ending' | 'appraisal';

function sortArtworks(rows: readonly Artwork[], mode: SortMode): Artwork[] {
  const next = [...rows];
  if (mode === 'tvl')
    next.sort((a, b) => Number(b.totalLockedMonWei) - Number(a.totalLockedMonWei));
  else if (mode === 'ending') next.sort((a, b) => a.predictionEndsAt - b.predictionEndsAt);
  else next.sort((a, b) => b.appraisalValueUsd - a.appraisalValueUsd);
  return next;
}

/** 首页首屏「当前最热」大卡；独立于下方列表卡片。 */
function HotFeaturedBanner({ artwork, now }: { artwork: Artwork; now: number }) {
  const ended = artwork.predictionEndsAt <= now;
  return (
    <Link
      to={`/art/${artwork.id}`}
      className="group relative isolate flex flex-col overflow-hidden rounded-3xl border border-accent/35 bg-gradient-to-br from-accent/25 via-neutral-950/90 to-neutral-950 shadow-xl shadow-accent/15 transition hover:border-accent/55 md:grid md:min-h-[320px] md:grid-cols-[1.35fr_minmax(0,1fr)]"
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
            <div className="text-neutral-500">当前估值快照</div>
            <div className="mt-1 text-sm font-semibold text-white">{formatUsd(artwork.appraisalValueUsd)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur">
            <div className="text-neutral-500">看涨强度</div>
            <div className="mt-1 text-sm font-semibold text-emerald-300">
              {(artwork.bullishPrice * 100).toFixed(0)}%
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 backdrop-blur sm:col-span-1">
            <div className="text-neutral-500">{ended ? '状态' : '预测截止倒计时'}</div>
            <div className="mt-1 text-sm font-semibold text-accent">
              {ended ? '已结束 · 查看结算' : countdownLabel(artwork.predictionEndsAt, now)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="text-[11px] text-neutral-400">
            总交易量：{' '}
            <span className="font-mono font-semibold text-neutral-100">
              {formatUsd(Number(formatEther(BigInt(artwork.totalLockedMonWei))))}
            </span>
            <span className="mt-1 block text-[10px] text-neutral-600">
              来自市场成交汇总。
            </span>
          </div>
          <span className="inline-flex items-center rounded-2xl bg-accent px-4 py-2.5 text-xs font-semibold text-[#14061f] transition group-hover:brightness-110">
            进入预测盘口 →
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArtCard({ artwork, now }: { artwork: Artwork; now: number }) {
  const ended = artwork.predictionEndsAt <= now;
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
          <p className="mt-1 text-xs text-neutral-400">{artwork.artist}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-neutral-300">
          <div>
            <div className="text-neutral-500">当前估值</div>
            <div className="mt-1 font-semibold text-white">{formatUsd(artwork.appraisalValueUsd)}</div>
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
        </div>
        <div className="rounded-2xl bg-white/[0.03] px-3 py-2 text-[11px] text-neutral-400">
          总交易量：{' '}
          <strong className="text-neutral-200">
            <span className="text-accent">
              {formatUsd(Number(formatEther(BigInt(artwork.totalLockedMonWei))))}
            </span>
          </strong>
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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">艺术品 RWA 预测大厅</h1>
        <p className="max-w-2xl text-sm text-neutral-400">
          最热作品单独展示；下方为平台上其余可预测的 RWA。
        </p>
      </div>

      {/* 第一板块：当前最热 */}
      <section aria-labelledby="featured-heading" className="space-y-3">
        <h2 id="featured-heading" className="text-sm font-semibold text-neutral-200">
          当前最热的艺术品
        </h2>
        <HotFeaturedBanner artwork={featured} now={tick} />
      </section>

      {/* 第二板块：其他艺术品 */}
      <section aria-labelledby="other-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="other-heading" className="text-sm font-semibold text-neutral-200">
            平台上的其他艺术品
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
          <span className="text-xs text-neutral-500">本列表排序</span>
          {(
            [
              ['tvl', '总交易量 $'],
              ['ending', '结束时间最近'],
              ['appraisal', '估值最高'],
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
