/** 预测市场主合约占位（需在 .env 配置 `VITE_PREDICTION_MARKET_ADDRESS`）。 */
export const PREDICTION_MARKET_ADDRESS = (
  import.meta.env.VITE_PREDICTION_MARKET_ADDRESS ?? ''
).trim() as `0x${string}`;

/** 测试 USDC 占位（池中若使用 ERC20 计价，占位后续替换）。 */
export const TEST_USDC_ADDRESS = (import.meta.env.VITE_TEST_USDC_ADDRESS ?? '').trim() as `0x${string}`;

export function isConfiguredMarketAddress(addr: string): addr is `0x${string}` {
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) return false;
  if (addr.toLowerCase() === '0x0000000000000000000000000000000000000000') return false;
  return true;
}
