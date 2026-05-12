import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PricePoint } from '@/mock/priceHistory';

export function PriceMiniChart({ data }: { data: PricePoint[] }) {
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
            domain={[0, 1]}
            tickFormatter={(v) => `${(v as number).toFixed(2)}`}
            stroke="#a1a1aa"
            width={42}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: '#17151f',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fafafa',
            }}
            formatter={(value: number) => [`隐含看涨强度 ${value.toFixed(3)}`, '估值曲线']}
            labelFormatter={(l) => `日期 ${l}`}
          />
          <Area
            type="monotone"
            dataKey="bullish"
            stroke="#c084fc"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#bullishFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 text-[11px] text-neutral-500">
        「REPLACE_HISTORY_FROM_CHAIN_EVENTS」数据源：以上为演示序列；请以链上 Swap/Sync
        类事件重建真实走势。
      </div>
    </div>
  );
}
