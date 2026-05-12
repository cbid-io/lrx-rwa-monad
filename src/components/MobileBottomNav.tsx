import { NavLink } from 'react-router-dom';

export function MobileBottomNav() {
  const cls = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    [
      'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px]',
      isActive ? 'text-accent' : 'text-neutral-400',
    ].join(' ');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0c0b12]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex max-w-xl mx-auto">
        <NavLink end to="/" className={cls}>
          <span className="text-lg leading-none">◆</span>
          <span>市场</span>
        </NavLink>
        <NavLink to="/leaderboard" className={cls}>
          <span className="text-lg leading-none">◎</span>
          <span>排行</span>
        </NavLink>
        <NavLink to="/dashboard" className={cls}>
          <span className="text-lg leading-none">◉</span>
          <span>我的</span>
        </NavLink>
      </div>
    </nav>
  );
}
