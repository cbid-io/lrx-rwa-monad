/** 前端展示用地址脱敏：`0x1234…5678` */
export function shortAddress(addr: string | undefined, left = 6, right = 4): string {
  if (!addr) return '';
  const a = addr.trim();
  if (a.length <= left + right + 2) return a;
  return `${a.slice(0, left)}…${a.slice(-right)}`;
}

/** 格式化数字为两位小数 MON */
export function formatMon(value?: bigint): string {
  if (value === undefined) return '—';
  const n = Number(value) / 1e18;
  if (!Number.isFinite(n)) return '—';
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} MON`;
}

export function formatUsd(n: number): string {
  return `$${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(n)}`;
}

export function countdownLabel(endMs: number, nowMs: number): string {
  const diff = Math.max(0, endMs - nowMs);
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}天 ${h}时`;
  if (h > 0) return `${h}时 ${m}分`;
  return `${Math.max(0, m)}分`;
}
