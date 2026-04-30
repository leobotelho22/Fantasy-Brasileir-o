'use client';
import Link from 'next/link';
import { Trophy, Star, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AuctionCard from '@/components/AuctionCard';
import CoinBalance from '@/components/CoinBalance';
import CountdownTimer from '@/components/CountdownTimer';
import Badge from '@/components/Badge';
import { Avatar } from '@/components/PlayerRow';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

export default function DashboardPage() {
  const { user, team, coins, round, league, auctions } = useStore();

  const sorted = [...(league?.members ?? [])].sort((a, b) => b.pts - a.pts);
  const myRank  = sorted.findIndex(m => m.teamId === 'team_me') + 1;
  const myEntry = sorted.find(m => m.teamId === 'team_me');

  const myPlayers = (team.players ?? [])
    .map(id => ALL_PLAYERS.find(p => p.id === id))
    .filter(Boolean);

  const topAuctions = auctions.slice(0, 3);

  return (
    <AppLayout>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          Olá, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sub text-sm mt-1">{team.name} · Rodada {round.number}</p>
      </div>

      {/* Round banner */}
      <div className="card p-5 mb-6 flex items-center justify-between gap-4"
           style={{ background: 'linear-gradient(135deg, rgba(0,230,118,0.08), rgba(0,230,118,0.02))' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${round.status === 'live' ? 'bg-green animate-pulse' : 'bg-muted'}`} />
            <span className={`text-xs font-bold tracking-widest ${round.status === 'live' ? 'text-green' : 'text-sub'}`}>
              {round.status === 'live' ? 'AO VIVO' : round.status === 'finished' ? 'ENCERRADA' : 'EM BREVE'}
            </span>
          </div>
          <div className="text-xl font-black text-white">Rodada {round.number}</div>
          {round.status !== 'finished' && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-sub">
              <Clock size={11} />
              <span>Prazo:</span>
              <CountdownTimer endsAt={round.deadline} className="text-xs" />
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-green">{(team.roundPts ?? 0).toFixed(1)}</div>
          <div className="text-xs text-sub mt-0.5">pts na rodada</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Trophy}    label="Classificação"  value={`#${myRank}`}                   color="text-gold"  />
        <StatCard icon={Star}      label="Total de pts"   value={(team.totalPts ?? 0).toFixed(1)} color="text-green" />
        <StatCard icon={Users}     label="Liga"           value={league?.name.split(' ')[0]}      color="text-info"  />
        <StatCard icon={TrendingUp} label="Jogadores"     value={`${myPlayers.length}/23`}        color="text-sub"   />
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: team preview + auctions */}
        <div className="lg:col-span-2 space-y-6">

          {/* Team preview */}
          <section>
            <SectionHeader title="Meu Time" href="/meu-time" />
            <div className="card overflow-hidden">
              {myPlayers.length === 0 ? (
                <div className="p-8 text-center text-sub text-sm">
                  Nenhum jogador ainda. Vá ao Draft ou Mercado.
                </div>
              ) : (
                <div className="divide-y divide-rim">
                  {myPlayers.slice(0, 6).map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-rim/40 transition-colors">
                      <Avatar nick={p.nick} pos={p.pos} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">{p.nick}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge label={p.pos} small />
                          <span className="text-xs text-sub">{p.club}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${p.id === team.captain ? 'text-gold' : 'text-green'}`}>
                          {p.id === team.captain ? ((p.pts ?? 0) * 2).toFixed(1) : (p.pts ?? 0).toFixed(1)}
                        </div>
                        {p.id === team.captain && (
                          <div className="text-[9px] text-gold font-bold">CAP ×2</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {myPlayers.length > 6 && (
                    <Link href="/meu-time" className="flex items-center justify-center gap-1 py-2.5 text-xs text-sub hover:text-green transition-colors">
                      +{myPlayers.length - 6} jogadores <ChevronRight size={13} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Auctions preview */}
          <section>
            <SectionHeader title="Leilões ativos" href="/mercado" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topAuctions.map(a => (
                <AuctionCard
                  key={a.id}
                  auction={a}
                  isHighBidder={a.highBidderTeamId === 'team_me'}
                  onBid={() => {}}
                />
              ))}
              {topAuctions.length === 0 && (
                <div className="col-span-3 card p-8 text-center text-sub text-sm">Nenhum leilão ativo.</div>
              )}
            </div>
          </section>
        </div>

        {/* Right: ranking + balance */}
        <div className="space-y-6">
          {/* My balance */}
          <section>
            <SectionHeader title="Meu saldo" />
            <div className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-sub mb-1">Moedas disponíveis</div>
                <CoinBalance amount={useStore.getState().coins} />
              </div>
              <Link href="/mercado" className="text-xs text-green font-semibold hover:underline">
                Ir ao mercado →
              </Link>
            </div>
          </section>

          {/* League ranking */}
          <section>
            <SectionHeader title="Ranking da liga" href="/ranking" />
            <div className="card overflow-hidden">
              {sorted.slice(0, 8).map((m, i) => {
                const isMe = m.teamId === 'team_me';
                const medal = [null, 'text-gold', 'text-silver', 'text-bronze'][i + 1] ?? null;
                return (
                  <div
                    key={m.teamId}
                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-rim last:border-0 ${isMe ? 'bg-green-glow' : 'hover:bg-rim/30'} transition-colors`}
                  >
                    <span className={`w-5 text-xs font-bold ${medal ?? 'text-muted'}`}>#{i + 1}</span>
                    <span className={`flex-1 text-sm truncate ${isMe ? 'text-green font-bold' : 'text-white font-medium'}`}>
                      {m.teamName}
                    </span>
                    <span className="text-green text-sm font-bold tabular-nums">{m.pts.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <Icon size={18} className={color} />
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-sub">{label}</div>
    </div>
  );
}

function SectionHeader({ title, href }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-green hover:underline flex items-center gap-0.5">
          Ver tudo <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}
