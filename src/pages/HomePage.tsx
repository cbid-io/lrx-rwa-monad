import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_ARTWORKS, type Artwork } from '@/mock/artworks';
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
          总锁仓（演示 MON）：{' '}
          <strong className="text-neutral-200">
            {/* 实测排序依赖 wei 占位；应从 `getPoolTotals` */}
            {Number(formatEther(BigInt(artwork.totalLockedMonWei))).toFixed(1)}{' '}
            <span className="text-accent">MON</span>
          </strong>
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const [sort, setSort] = useState<SortMode>('tvl');
  const [tick, setTick] = useState(() => Date.now());

  /** 周期性刷新倒计时显示（独立于池子 RPC 轮询）。 */
  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(() => sortArtworks(MOCK_ARTWORKS, sort), [sort]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">艺术品 RWA 预测大厅</h1>
        <p className="max-w-2xl text-sm text-neutral-400">
          「全部卡片数据均由示例 JSON 占位；正式上线后请通过合约视图函数 / indexer 拉取」。点击卡片查看预测盘口、走势图与结算信息。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500">排序</span>
        {(
          [
            ['tvl', '总锁仓 MON'],
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((a) => (
          <ArtCard key={a.id} artwork={a} now={tick} />
        ))}
      </div>
    </div>
  );
}
