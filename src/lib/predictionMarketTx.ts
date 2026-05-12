import type { Address } from 'viem';
import { predictionMarketAbi } from '@/abi/predictionMarket';
import { PREDICTION_MARKET_ID_OVERRIDE } from '@/config/predictionMarket';

/** 链下占位映射：同一艺术品下按档位递增 marketId；若与合约 `createMarket` 返回值不一致会导致下注回滚。 */
export function marketIdForArtworkTier(artworkId: string, tierIndex: number): bigint {
  return BigInt(artworkId) * 1000n + BigInt(tierIndex);
}

export type ResolvePredictionMarketIdArgs = {
  artworkId: string;
  tierIndex: number;
  /** 档位上配置的链上 `marketId`（来自 `createMarket` 或浏览器 / 子图） */
  tierChainMarketId?: string | undefined;
  /** 合约 `marketCount()`；若仅为 1，则当前部署下唯一有效 id 通常为 `0`。 */
  chainMarketCount?: bigint | undefined;
};

/**
 * 解析写入合约用的 `marketId`：
 * 1. `VITE_PREDICTION_MARKET_ID`
 * 2. 档位 `chainMarketId`
 * 3. 仅存在一个链上市场时 → `0n`
 * 4. 否则回退 `marketIdForArtworkTier`
 */
export function resolvePredictionMarketId(args: ResolvePredictionMarketIdArgs): bigint {
  if (/^[0-9]+$/.test(PREDICTION_MARKET_ID_OVERRIDE)) {
    return BigInt(PREDICTION_MARKET_ID_OVERRIDE);
  }

  const tierRaw = args.tierChainMarketId?.trim();
  if (tierRaw && /^[0-9]+$/.test(tierRaw)) {
    return BigInt(tierRaw);
  }

  if (args.chainMarketCount === 1n) {
    return 0n;
  }

  return marketIdForArtworkTier(args.artworkId, args.tierIndex);
}

export type PredictionBetSide = 'yes' | 'no';

export function predictionBetFunctionName(side: PredictionBetSide): 'betYes' | 'betNo' {
  return side === 'yes' ? 'betYes' : 'betNo';
}

/** 供 `writeContract` / `writeContractAsync` 使用的预测下注参数封装。 */
export function predictionBetWriteRequest(args: {
  marketAddress: Address;
  side: PredictionBetSide;
  marketId: bigint;
  amount: bigint;
}) {
  const { marketAddress, side, marketId, amount } = args;
  return {
    address: marketAddress,
    abi: predictionMarketAbi,
    functionName: predictionBetFunctionName(side),
    args: [marketId, amount] as const,
  } as const;
}
