import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { monadTestnet } from '@/lib/monad';

export function WrongNetworkRibbon() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, status } = useSwitchChain();

  if (!isConnected || chainId === monadTestnet.id) return null;

  return (
    <div className="border-b border-yellow-600/35 bg-yellow-950/80 px-4 py-3 text-yellow-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
        <span>当前钱包网络不是 Monad Testnet（链 ID {chainId}），请切换到链 ID {monadTestnet.id}。</span>
        <button
          type="button"
          className="self-start rounded-xl bg-yellow-600 px-4 py-2 text-sm font-medium text-yellow-950 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={status === 'pending'}
          onClick={() => switchChain({ chainId: monadTestnet.id })}
        >
          {status === 'pending' ? '切换中…' : '一键切换 Monad Testnet'}
        </button>
      </div>
    </div>
  );
}
