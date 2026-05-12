import type { Address } from 'viem';
import { predictionMarketAbi } from '@/abi/predictionMarket';

/** 链下占位映射：同一艺术品下按档位递增 marketId；实盘请替换为链上真实 marketId / indexer。 */
export function marketIdForArtworkTier(artworkId: string, tierIndex: number): bigint {
  return BigInt(artworkId) * 1000n + BigInt(tierIndex);
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
