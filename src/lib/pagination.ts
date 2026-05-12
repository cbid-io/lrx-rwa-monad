import type { LeaderboardRow } from '@/mock/leaderboard';

/** 分页工具：数据源替换为 indexer 后继续复用同一逻辑 */

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export function paginatePredictionsHistory<T>(
  all: readonly T[],
  page: number,
  pageSize: number,
): Page<T> {
  const total = all.length;
  const start = (page - 1) * pageSize;
  return { items: all.slice(start, start + pageSize), total, page, pageSize };
}

export function filterLeaderboardByPreset(
  rows: readonly LeaderboardRow[],
  preset: 'all' | 'month' | 'week',
): LeaderboardRow[] {
  const now = Date.now();
  const cutoff =
    preset === 'week' ? now - 7 * 86400000 : preset === 'month' ? now - 30 * 86400000 : 0;
  return rows.filter((r) => r.settledAt >= cutoff);
}
