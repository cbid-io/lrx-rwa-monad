import { defineChain } from 'viem';

/** Monad Testnet 硬编码参数（按需与官方核对链 ID / RPC） */
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_RPC_URL ?? 'https://testnet-rpc.monad.xyz/'] },
    public: { http: [import.meta.env.VITE_RPC_URL ?? 'https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com/' },
  },
});

export const MONAD_EXPLORER_TX = `${monadTestnet.blockExplorers.default.url}tx/` as const;

export const FAUCET_INFO =
  '请前往 Monad 官方 Discord 的「水龙头/Faucet」频道领取测试代币。';
