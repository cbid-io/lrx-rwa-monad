import type { Address } from 'viem';
import { erc20Abi } from '@/abi/erc20';

/** `useReadContract` / `readContract`：查询授权额度。 */
export function erc20AllowanceReadArgs(args: {
  token: Address;
  owner: Address;
  spender: Address;
}) {
  const { token, owner, spender } = args;
  return {
    address: token,
    abi: erc20Abi,
    functionName: 'allowance' as const,
    args: [owner, spender] as const,
  } as const;
}

export function erc20DecimalsReadArgs(token: Address) {
  return {
    address: token,
    abi: erc20Abi,
    functionName: 'decimals' as const,
  } as const;
}

/** `approve(spender, amount)` 写入参数封装。 */
export function erc20ApproveWriteArgs(args: {
  token: Address;
  spender: Address;
  amount: bigint;
}) {
  const { token, spender, amount } = args;
  return {
    address: token,
    abi: erc20Abi,
    functionName: 'approve' as const,
    args: [spender, amount] as const,
  } as const;
}
