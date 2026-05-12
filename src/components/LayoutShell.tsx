import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { WalletBar } from '@/components/WalletBar';
import { WrongNetworkRibbon } from '@/components/WrongNetworkRibbon';
import { MobileBottomNav } from '@/components/MobileBottomNav';

function SideNavLinks() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-xl px-3 py-2 text-sm transition-colors',
      isActive
        ? 'border border-accent/35 bg-accent-soft text-accent'
        : 'text-neutral-300 hover:bg-white/5',
    ].join(' ');

  return (
    <nav className="sticky top-24 flex flex-col gap-1 px-4 py-2">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
        菜单
      </div>
      <NavLink end to="/" className={linkCls}>
        艺术品市场
      </NavLink>
      <NavLink to="/leaderboard" className={linkCls}>
        排行榜
      </NavLink>
      <NavLink to="/dashboard" className={linkCls}>
        仪表盘
      </NavLink>
    </nav>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0b12]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-[11px] font-bold tracking-tighter text-white">
            RWA
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-white md:text-base">艺术品预测市场</div>
            <div className="hidden text-[11px] text-neutral-400 sm:block">Monad Testnet · 纯前端预览</div>
          </div>
        </div>
        <WalletBar />
      </div>
    </header>
  );
}

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100svh] pb-24 md:pb-10">
      <WrongNetworkRibbon />
      <Header />
      <div className="mx-auto grid max-w-7xl md:grid-cols-[230px,minmax(0,1fr)] md:gap-6">
        <aside className="hidden md:block">
          <SideNavLinks />
          <div className="mx-4 mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-neutral-400">
            测试代币：请前往 Monad 官方 Discord 的<strong className="text-neutral-200"> 水龙头 </strong>
            频道领取 MON。
          </div>
        </aside>
        <section className="min-w-0 px-4 py-6 md:px-0 md:pr-8">{children}</section>
      </div>
      <MobileBottomNav />
    </div>
  );
}
