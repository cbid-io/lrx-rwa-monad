import { SUBGRAPH_API_KEY, SUBGRAPH_URL, isSubgraphConfigured } from '@/config/subgraph';

const MARKET_BETS_QUERY = `
  query MarketBets($marketId: BigInt!, $skip: Int!) {
    betPlaceds(
      where: { marketId: $marketId }
      first: 1000
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: asc
    ) {
      yesSide
      amount
    }
  }
`;

type BetPlacedRow = {
  yesSide: boolean;
  amount: string;
};

type MarketBetsResponse = {
  data?: {
    betPlaceds: BetPlacedRow[];
  };
  errors?: Array<{ message: string }>;
};

async function postSubgraph<T>(body: Record<string, unknown>): Promise<T> {
  if (!isSubgraphConfigured(SUBGRAPH_URL)) {
    throw new Error('SUBGRAPH_URL_NOT_CONFIGURED');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (SUBGRAPH_API_KEY) {
    headers.Authorization = `Bearer ${SUBGRAPH_API_KEY}`;
  }

  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Subgraph HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

/** 分页拉取并汇总某一市场的「是 / 否」侧抵押总额（与合约 `BetPlaced.amount` 一致，最小单位）。 */
export async function fetchMarketBetSideTotalsWei(marketId: bigint): Promise<{
  yesWei: bigint;
  noWei: bigint;
}> {
  let yesWei = 0n;
  let noWei = 0n;
  let skip = 0;
  const page = 1000;

  for (;;) {
    const json = await postSubgraph<MarketBetsResponse>({
      query: MARKET_BETS_QUERY,
      variables: {
        marketId: marketId.toString(),
        skip,
      },
    });

    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join('; '));
    }

    const rows = json.data?.betPlaceds ?? [];
    for (const row of rows) {
      const amt = BigInt(row.amount);
      if (row.yesSide) yesWei += amt;
      else noWei += amt;
    }

    if (rows.length < page) break;
    skip += page;
  }

  return { yesWei, noWei };
}
