'use client';
import { Trophy, TrendingUp, Star } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import useStore from '@/store/useStore';

const MEDAL = { 0: '🥇', 1: '🥈', 2: '🥉' };
const MEDAL_COLOR = { 0: 'text-gold', 1: 'text-silver', 2: 'text-bronze' };

export default function RankingPage() {
  const { league, team } = useStore();

  const sorted = [...(league?.members ?? [])].sort((a, b) => b.pts - a.pts);
  const myRank  = sorted.findIndex(m => m.teamId === 'team_me');
  const myEntry = sorted[myRank];

  const leader = sorted[0];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">{league?.name ?? 'Ranking'}</h1>
        <p className="text-sub text-sm mt-1">
          {sorted.length} times · Rodada {league?.currentRound ?? 1}
        </p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {sorted.slice(0, 3).map((m, i) => {
          const isMe = m.teamId === 'team_me';
          return (
            <div
              key={m.teamId}
              className={`card p-4 text-center transition-all ${
                i === 0
                  ? 'border-gold/30 bg-gold/5 order-first'
                  : i === 1
                  ? 'border-silver/20'
                  : 'border-bronze/20'
              } ${isMe ? 'ring-1 ring-green/40' : ''}`}
            >
              <div className="text-2xl mb-1">{MEDAL[i]}</div>
              <div className={`text-sm font-bold truncate ${isMe ? 'text-green' : 'text-white'}`}>
                {m.teamName}
                {isMe && <span className="text-[10px] text-green ml-1">(você)</span>}
              </div>
              <div className={`text-xl font-black mt-1 ${MEDAL_COLOR[i]}`}>
                {m.pts.toFixed(1)}
              </div>
              <div className="text-[10px] text-muted mt-0.5">pontos</div>
            </div>
          );
        })}
      </div>

      {/* My position highlight */}
      {myEntry && myRank >= 3 && (
        <div className="card p-4 mb-4 border-green/20 bg-green-glow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-black text-green">#{myRank + 1}</div>
            <div>
              <div className="text-sm font-bold text-green">{myEntry.teamName}</div>
              <div className="text-xs text-sub">Sua posição atual</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white">{myEntry.pts.toFixed(1)}</div>
            <div className="text-xs text-sub">pts totais</div>
          </div>
        </div>
      )}

      {/* Full standings table */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_90px_90px_60px_60px] gap-2 px-4 py-3 border-b border-rim text-[10px] text-muted font-bold uppercase tracking-wider">
          <div className="text-center">#</div>
          <div>Time</div>
          <div className="text-right">Rodada</div>
          <div className="text-right">Total</div>
          <div className="text-right hidden sm:block">J</div>
          <div className="text-right hidden sm:block">V</div>
        </div>

        {sorted.map((m, i) => {
          const isMe    = m.teamId === 'team_me';
          const gap     = leader ? (m.pts - leader.pts).toFixed(1) : '0.0';
          const hasMedal = i < 3;

          return (
            <div
              key={m.teamId}
              className={`grid grid-cols-[40px_1fr_90px_90px_60px_60px] gap-2 items-center px-4 py-3 border-b border-rim last:border-0 transition-colors ${
                isMe ? 'bg-green-glow' : 'hover:bg-rim/20'
              }`}
            >
              {/* Rank */}
              <div className="text-center">
                {hasMedal ? (
                  <span className="text-lg leading-none">{MEDAL[i]}</span>
                ) : (
                  <span className={`text-sm font-bold ${isMe ? 'text-green' : 'text-muted'}`}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Team name */}
              <div>
                <div className={`text-sm font-semibold truncate ${isMe ? 'text-green' : 'text-white'}`}>
                  {m.teamName}
                  {isMe && <span className="text-[10px] text-sub font-normal ml-1.5">você</span>}
                </div>
                {i > 0 && (
                  <div className="text-[10px] text-muted mt-0.5">
                    {gap} pts do líder
                  </div>
                )}
              </div>

              {/* Round pts */}
              <div className="text-right">
                <span className="text-sm font-semibold text-sub tabular-nums">
                  {m.roundPts?.toFixed(1) ?? '—'}
                </span>
              </div>

              {/* Total pts */}
              <div className="text-right">
                <span className={`text-sm font-black tabular-nums ${isMe ? 'text-green' : 'text-white'}`}>
                  {m.pts.toFixed(1)}
                </span>
              </div>

              {/* Played */}
              <div className="text-right hidden sm:block">
                <span className="text-xs text-sub tabular-nums">{m.played ?? 0}</span>
              </div>

              {/* Wins */}
              <div className="text-right hidden sm:block">
                <span className="text-xs text-sub tabular-nums">{m.wins ?? 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
        <span><strong className="text-sub">J</strong> = Jogos disputados</span>
        <span><strong className="text-sub">V</strong> = Vitórias</span>
        <span><strong className="text-sub">Rodada</strong> = Pts na rodada atual</span>
        <span><strong className="text-sub">Total</strong> = Soma de todas as rodadas</span>
      </div>
    </AppLayout>
  );
}
