/** 仅为前端联调的模拟 ABI；实盘请对齐已部署合约。 */
export const predictionMarketAbi = [
  {
    type: 'function',
    name: 'buyOutcome',
    stateMutability: 'payable',
    inputs: [
      { name: 'artworkId', type: 'uint256' },
      { name: 'outcome', type: 'uint8', internalType: 'enum Outcome' },
      /** 若合约使用 ERC20，`value` 为 0，`amount` 走 approve+transferFrom；占位按 payable MON 语义。 */
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'claimRewards',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'positionIds', type: 'uint256[]' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getPoolTotals',
    stateMutability: 'view',
    inputs: [{ name: 'artworkId', type: 'uint256' }],
    outputs: [
      { name: 'bullLocked', type: 'uint256' },
      { name: 'bearLocked', type: 'uint256' },
      { name: 'bullPriceScaled', type: 'uint256' },
      { name: 'bearPriceScaled', type: 'uint256' },
    ],
  },
] as const;
