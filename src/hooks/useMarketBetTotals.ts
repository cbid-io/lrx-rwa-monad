import { useQuery } from '@tanstack/react-query';
import { SUBGRAPH_URL, isSubgraphConfigured } from '@/config/subgraph';
import { fetchMarketBetSideTotalsWei } from '@/lib/subgraphPredictionMarket';

export function useMarketBetTotalsWei(marketId: bigint | undefined) {
  return useQuery({
    queryKey: ['predictionMarketBetTotals', SUBGRAPH_URL, marketId?.toString()],
    enabled: Boolean(marketId !== undefined && isSubgraphConfigured(SUBGRAPH_URL)),
    queryFn: async () => {
      if (marketId === undefined) {
        return { yesWei: 0n, noWei: 0n };
      }
      return fetchMarketBetSideTotalsWei(marketId);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
