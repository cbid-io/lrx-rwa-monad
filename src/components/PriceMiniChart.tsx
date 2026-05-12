import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AuctionPricePoint } from '@/mock/priceHistory';

function formatHkdShort(value: number): string {
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}千万`;
  if (value >= 10_000) return `${Math.round(value / 10_000)}万`;
  return value.toLocaleString('zh-HK');
}

export function PriceMiniChart({ data }: { data: AuctionPricePoint[] }) {
  return (
    <div className="h-56 w-full md:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bullishFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ffffff10" strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="t" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => formatHkdShort(v as number)}
            stroke="#a1a1aa"
            width={62}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: '#17151f',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fafafa',
            }}
            formatter={(value: number) => [`HK$ ${value.toLocaleString('zh-HK')}`, '成交价']}
            labelFormatter={(l) => `成交日期 ${l}`}
          />
          <Area
            type="monotone"
            dataKey="auctionPriceHkd"
            stroke="#c084fc"
            strokeWidth={2}
            dot={{
              r: 4,
              fill: '#17151f',
              stroke: '#c084fc',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: '#f5d0fe',
              stroke: '#c084fc',
              strokeWidth: 2,
            }}
            fillOpacity={1}
            fill="url(#bullishFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 text-[11px] text-neutral-500">
        数据源：拍卖行成交公告 / oracle / indexer。
      </div>
    </div>
  );
}
