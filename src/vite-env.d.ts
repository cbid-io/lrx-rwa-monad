/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PREDICTION_MARKET_ADDRESS: string;
  readonly VITE_TEST_USDC_ADDRESS: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_RPC_URL?: string;
  /** The Graph / Goldsky 等提供的预测市场子图 HTTP 查询端点 */
  readonly VITE_SUBGRAPH_URL?: string;
  /** The Graph Studio 查询密钥（请求头 `Authorization: Bearer …`） */
  readonly VITE_SUBGRAPH_API_KEY?: string;
  /** 可选：链上 `marketId`（十进制）。多档位并行部署时可不配，改用档位上的 `chainMarketId`。 */
  readonly VITE_PREDICTION_MARKET_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
