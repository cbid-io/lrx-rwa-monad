import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monadTestnet } from '@/lib/monad';

/**
 * RainbowKit WalletConnect Project ID：`https://dashboard.reown.com` 新建项目后填入
 * `.env` 下的 `VITE_WALLETCONNECT_PROJECT_ID`。
 */
export const wagmiConfig = getDefaultConfig({
  appName: '艺术品 RWA 预测市场',
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || '00000000000000000000000000000000',
  chains: [monadTestnet],
  ssr: false,
});
