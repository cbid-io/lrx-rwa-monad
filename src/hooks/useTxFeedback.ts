import { useEffect, useRef } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useToast } from '@/context/Toast';
import { MONAD_EXPLORER_TX } from '@/lib/monad';

export function useTxReceiptFeedback(hash?: `0x${string}`) {
  const { push } = useToast();
  const confirmedRef = useRef(false);
  const errorRef = useRef(false);

  const query = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  useEffect(() => {
    if (!hash) {
      confirmedRef.current = false;
      errorRef.current = false;
    }
  }, [hash]);

  useEffect(() => {
    if (!hash || !query.isSuccess || confirmedRef.current) return;
    confirmedRef.current = true;
    push(
      `链上确认完成。哈希 ${hash.slice(0, 12)}… Monad 浏览器：${MONAD_EXPLORER_TX}${hash}`,
      'info',
    );
  }, [hash, push, query.isSuccess]);

  useEffect(() => {
    if (!hash || !query.isError || errorRef.current || !query.error) return;
    errorRef.current = true;
    const msg = query.error.message ?? '交易确认失败';
    push(
      msg.includes('user rejected')
        ? '用户取消或在钱包拒绝了交易。'
        : msg.includes('insufficient funds')
          ? '余额不足以支付手续费或下注金额，请先到水龙头充值。'
          : `链上错误或回滚：${msg.slice(0, 200)}`,
      'error',
    );
  }, [hash, push, query.error, query.isError]);

  return {
    confirming: Boolean(hash && query.isFetching),
    receipt: query.data,
  };
}
