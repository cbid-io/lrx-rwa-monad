/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PREDICTION_MARKET_ADDRESS: string;
  readonly VITE_TEST_USDC_ADDRESS: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
