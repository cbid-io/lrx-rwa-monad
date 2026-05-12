import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { WalletBar } from '@/components/WalletBar';
import { WrongNetworkRibbon } from '@/components/WrongNetworkRibbon';
import { MobileBottomNav } from '@/components/MobileBottomNav';

function TopNavLinks() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-xl px-3 py-2 text-sm transition-colors',
      isActive
        ? 'border border-accent/35 bg-accent-soft text-accent'
        : 'text-neutral-300 hover:bg-white/5',
    ].join(' ');

  return (
    <nav className="hidden items-center gap-4 md:flex">
      <NavLink end to="/" className={linkCls}>
        预测市场
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
        <div className="mr-[30px] flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-[11px] font-bold tracking-tighter text-white">
            RWA
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-white md:text-base">YesNo Monad  艺术品RWA预测市场</div>
          </div>
        </div>
        <TopNavLinks />
        <div className="flex-1" />
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
      <div className="mx-auto max-w-7xl">
        <section className="min-w-0 px-4 py-6">{children}</section>
      </div>
      <MobileBottomNav />
    </div>
  );
}
