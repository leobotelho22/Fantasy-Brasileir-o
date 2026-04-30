'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Home, Users, ShoppingBag, Layers, ArrowLeftRight, Trophy, LogOut } from 'lucide-react';
import useStore from '@/store/useStore';
import CoinBalance from './CoinBalance';
import ToastContainer from './Toast';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/meu-time',  label: 'Meu Time',  icon: Users },
  { href: '/mercado',   label: 'Mercado',   icon: ShoppingBag },
  { href: '/draft',     label: 'Draft',     icon: Layers },
  { href: '/trades',    label: 'Trades',    icon: ArrowLeftRight },
  { href: '/ranking',   label: 'Ranking',   icon: Trophy },
];

export default function AppLayout({ children }) {
  const { isLoggedIn, team, coins, trades, logout } = useStore();
  const pathname = usePathname();
  const router   = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (mounted && !isLoggedIn) router.replace('/login'); }, [mounted, isLoggedIn, router]);

  // Count pending incoming trades for the badge
  const pendingTrades = (trades ?? []).filter(
    t => t.toTeamId === 'team_me' && t.status === 'pending'
  ).length;

  if (!mounted) return <div className="min-h-screen bg-bg" />;
  if (!isLoggedIn) return null;

  return (
    <div className="flex min-h-screen bg-bg text-white">

      {/* ── Toast container (always on top) ─────────────────────────── */}
      <ToastContainer />

      {/* ── Sidebar (desktop) ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface border-r border-rim fixed h-full z-20">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-rim">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-glow border border-green/30 flex items-center justify-center font-black text-lg text-green select-none">
              B
            </div>
            <div>
              <div className="text-base font-black text-white tracking-tight leading-none">Bolei</div>
              <div className="text-xs text-sub mt-0.5">Fantasy Futebol</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            const badge  = href === '/trades' && pendingTrades > 0 ? pendingTrades : 0;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  active
                    ? 'bg-green-glow text-green border border-green/20'
                    : 'text-sub hover:bg-rim hover:text-white'
                )}
              >
                <Icon size={15} strokeWidth={2.2} />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-black flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-rim space-y-3">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Meu time</div>
            <div className="text-sm font-bold text-white truncate">{team?.name}</div>
            <div className="text-xs text-sub mt-0.5">{(team?.players ?? []).length}/23 jogadores</div>
          </div>
          <CoinBalance amount={coins} />
          <button
            onClick={() => { logout(); router.replace('/login'); }}
            className="flex items-center gap-1.5 text-xs text-sub hover:text-danger transition-colors"
          >
            <LogOut size={12} />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-10 bg-surface border-b border-rim px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-glow border border-green/30 flex items-center justify-center text-sm font-black text-green">
              B
            </div>
            <span className="font-black text-white text-sm">Bolei</span>
          </div>
          <div className="flex items-center gap-3">
            {pendingTrades > 0 && (
              <Link href="/trades" className="relative">
                <ArrowLeftRight size={18} className="text-sub" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {pendingTrades}
                </span>
              </Link>
            )}
            <CoinBalance amount={coins} />
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile) ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-rim z-20">
        <div className="flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            const badge  = href === '/trades' && pendingTrades > 0 ? pendingTrades : 0;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors relative',
                  active ? 'text-green' : 'text-muted'
                )}
              >
                <div className="relative">
                  <Icon size={19} strokeWidth={2} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-danger rounded-full text-[8px] font-black text-white flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
