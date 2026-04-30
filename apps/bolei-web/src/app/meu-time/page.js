'use client';
import { useState } from 'react';
import { Star, UserMinus, AlertTriangle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Badge from '@/components/Badge';
import CoinBalance from '@/components/CoinBalance';
import PlayerStatusBadge from '@/components/PlayerStatusBadge';
import { Avatar } from '@/components/PlayerRow';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

const MAX_SQUAD = 23;

export default function MyTeamPage() {
  const { team, coins } = useStore();
  const [captainId, setCaptainId] = useState(team.captain ?? null);
  const [sortBy, setSortBy]       = useState('pts'); // 'pts' | 'avg' | 'pos'

  const myPlayers = (team.players ?? [])
    .map(id => ALL_PLAYERS.find(p => p.id === id))
    .filter(Boolean)
    .sort((a, b) => {
      if (sortBy === 'pts') return (b.pts ?? 0) - (a.pts ?? 0);
      if (sortBy === 'avg') return (b.avg ?? 0) - (a.avg ?? 0);
      if (sortBy === 'pos') return a.pos.localeCompare(b.pos);
      return 0;
    });

  const totalRoundPts = myPlayers.reduce((s, p) =>
    s + (p.id === captainId ? (p.pts ?? 0) * 2 : (p.pts ?? 0)), 0
  );

  const slots = MAX_SQUAD - myPlayers.length;

  const byPos = myPlayers.reduce((acc, p) => {
    acc[p.pos] = (acc[p.pos] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">{team.name}</h1>
          <p className="text-sub text-sm mt-1">
            {myPlayers.length}/{MAX_SQUAD} jogadores
            {slots > 0 && <span className="text-green font-semibold"> · {slots} vaga{slots !== 1 ? 's' : ''} livre{slots !== 1 ? 's' : ''}</span>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CoinBalance amount={coins} />
          <div className="text-right">
            <div className="text-3xl font-black text-green">{totalRoundPts.toFixed(1)}</div>
            <div className="text-xs text-sub">pts na rodada</div>
          </div>
        </div>
      </div>

      {/* Position summary pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(byPos).map(([pos, count]) => (
          <div key={pos} className="flex items-center gap-1.5 bg-surface border border-rim rounded-full px-3 py-1">
            <Badge label={pos} small />
            <span className="text-xs text-sub font-semibold">×{count}</span>
          </div>
        ))}
        {myPlayers.length === 0 && (
          <span className="text-sub text-sm">Nenhum jogador no time ainda.</span>
        )}
      </div>

      {/* Alert: injured or suspended players in the squad */}
      {(() => {
        const atRisk = myPlayers.filter(p => p.status === 'injured' || p.status === 'suspended');
        if (atRisk.length === 0) return null;
        return (
          <div className="flex items-start gap-3 bg-danger/10 border border-danger/25 rounded-xl px-4 py-3 mb-5">
            <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-danger mb-1">
                {atRisk.length} jogador{atRisk.length > 1 ? 'es' : ''} indisponível{atRisk.length > 1 ? 'is' : ''}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {atRisk.map(p => (
                  <span key={p.id} className="text-xs text-danger/80 bg-danger/10 rounded px-2 py-0.5 font-semibold">
                    {p.nick} · <span className="capitalize">{p.status === 'injured' ? 'Lesionado' : 'Suspenso'}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Controls: sort */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted">Ordenar por:</span>
        {[['pts','Pts rodada'],['avg','Média'],['pos','Posição']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              sortBy === key
                ? 'bg-green-glow border-green/30 text-green'
                : 'border-rim text-sub hover:border-[#253354] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Player table */}
      {myPlayers.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">⚽</div>
          <p className="text-sub">Seu time está vazio. Participe do Draft ou vá ao Mercado.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_80px_80px_80px_100px_56px] gap-3 px-4 py-2.5 border-b border-rim text-[10px] text-muted font-bold uppercase tracking-wider">
            <div className="w-10" />
            <div>Jogador</div>
            <div className="text-right">Pts</div>
            <div className="text-right">Méd</div>
            <div className="text-right">Status</div>
            <div className="text-center">Capitão</div>
            <div />
          </div>

          {myPlayers.map((p, i) => {
            const isCaptain = p.id === captainId;
            const pts = isCaptain ? (p.pts ?? 0) * 2 : (p.pts ?? 0);

            return (
              <div
                key={p.id}
                className={`flex sm:grid sm:grid-cols-[auto_1fr_80px_80px_80px_100px_56px] items-center gap-3 px-4 py-3 border-b border-rim last:border-0 transition-colors hover:bg-rim/30 ${isCaptain ? 'bg-gold/5' : ''}`}
              >
                {/* Avatar */}
                <Avatar nick={p.nick} pos={p.pos} size="sm" />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white truncate">{p.nick}</span>
                    {isCaptain && <span className="text-[9px] text-gold font-bold bg-gold/15 border border-gold/30 rounded px-1.5 py-0.5">CAP</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge label={p.pos} small />
                    <span className="text-xs text-sub">{p.club}</span>
                  </div>
                </div>

                {/* Pts */}
                <div className={`text-right text-sm font-bold ${isCaptain ? 'text-gold' : 'text-green'}`}>
                  {pts.toFixed(1)}
                  {isCaptain && <div className="text-[9px] text-gold">×2</div>}
                </div>

                {/* Avg */}
                <div className="text-right text-xs text-sub hidden sm:block">
                  {(p.avg ?? 0).toFixed(1)}
                </div>

                {/* Status */}
                <div className="hidden sm:flex justify-end">
                  <PlayerStatusBadge status={p.status} variant="badge" />
                </div>

                {/* Captain toggle */}
                <div className="hidden sm:flex justify-center">
                  <button
                    onClick={() => setCaptainId(isCaptain ? null : p.id)}
                    title={isCaptain ? 'Remover capitão' : 'Definir como capitão'}
                    className={`p-1.5 rounded-lg transition-all ${
                      isCaptain
                        ? 'text-gold bg-gold/15 hover:bg-gold/25'
                        : 'text-muted hover:text-gold hover:bg-gold/10'
                    }`}
                  >
                    {isCaptain ? <Star size={15} fill="currentColor" /> : <Star size={15} />}
                  </button>
                </div>

                {/* Drop (placeholder) */}
                <div className="hidden sm:flex justify-center">
                  <button
                    title="Liberar jogador"
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    onClick={() => alert(`Para liberar ${p.nick}, vá ao Mercado e inicie um leilão.`)}
                  >
                    <UserMinus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty slots */}
      {slots > 0 && myPlayers.length > 0 && (
        <div className="mt-4 card p-4 border-dashed flex items-center justify-between">
          <p className="text-sub text-sm">
            <span className="text-green font-bold">{slots}</span> vaga{slots !== 1 ? 's' : ''} disponível{slots !== 1 ? 'is' : ''}
          </p>
          <div className="flex gap-2">
            <a href="/draft"   className="text-xs text-green font-semibold hover:underline">→ Draft</a>
            <a href="/mercado" className="text-xs text-green font-semibold hover:underline">→ Mercado</a>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
