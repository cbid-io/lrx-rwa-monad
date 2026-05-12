/** Subgraph HTTP 端点（`.env` 配置 `VITE_SUBGRAPH_URL`，例如 Goldsky / Studio 提供的查询 URL）。 */
export const SUBGRAPH_URL = (import.meta.env.VITE_SUBGRAPH_URL ?? '').trim();

/** The Graph Studio：与查询 URL 配套的密钥，通过 `Authorization: Bearer` 发送。 */
export const SUBGRAPH_API_KEY = (import.meta.env.VITE_SUBGRAPH_API_KEY ?? '').trim();

export function isSubgraphConfigured(url: string): url is string {
  return url.length > 0 && /^https?:\/\//i.test(url);
}
