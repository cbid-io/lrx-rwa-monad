import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { monadTestnet } from '@/lib/monad';

export function WalletBar() {
  const { address, isConnecting } = useAccount();
  const { data } = useBalance({
    address,
    chainId: monadTestnet.id,
    query: { enabled: !!address },
  });

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {address ? (
        <div className="hidden flex-col items-end leading-tight sm:flex">
          <span className="text-[11px] text-neutral-500">
            余额{' '}
            <span className="text-accent">
              {data ? `${Number(formatEther(data.value)).toFixed(3)} MON` : '···'}
            </span>
          </span>
        </div>
      ) : (
        <span className="hidden text-[11px] text-neutral-500 sm:inline">{isConnecting ? '连接中…' : ''}</span>
      )}
      <ConnectButton showBalance={false} chainStatus="icon" />
    </div>
  );
}
