/** 将 ERC20 `decimals()` 返回值转为 `parseUnits` 可用的指数（viem 支持 0–77）。 */
export function erc20DecimalsToParseExponent(
  raw: number | bigint | undefined | null,
): number | null {
  if (raw === undefined || raw === null) return null;
  const n = typeof raw === 'bigint' ? Number(raw) : raw;
  if (!Number.isFinite(n)) return null;
  const d = Math.floor(n);
  if (d < 0 || d > 77) return null;
  return d;
}
