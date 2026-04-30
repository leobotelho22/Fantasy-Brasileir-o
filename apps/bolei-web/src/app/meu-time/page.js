'use client';
import { useState } from 'react';
import { Star, UserMinus, AlertTriangle, Siren } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Badge from '@/components/Badge';
import CoinBalance from '@/components/CoinBalance';
import PlayerStatusBadge from '@/components/PlayerStatusBadge';
import { Avatar } from '@/components/PlayerRow';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

const MAX_SQUAD = 23;

// Returns true for statuses that mean the player won't play
const isUnavailable = s => s === 'injured' || s === 'suspended';

export default function MyTeamPage() {
  const { team, coins, playerStatuses, addToast } = useStore();
  const [captainId, setCaptainId] = useState(team.captain ?? null);
  const [sortBy, setSortBy]       = useState('pts');

  // Merge store live overrides on top of mock data
  const myPlayers = (team.players ?? [])
    .map(id => {
      const p = ALL_PLAYERS.find(p => p.id === id);
      if (!p) return null;
      return playerStatuses[id] ? { ...p, status: playerStatuses[id] } : p;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (sortBy === 'pts') return (b.pts ?? 0) - (a.pts ?? 0);
      if (sortBy === 'avg') return (b.avg ?? 0) - (a.avg ?? 0);
      if (sortBy === 'pos') return a.pos.localeCompare(b.pos);
      return 0;
    });

  const captain = myPlayers.find(p => p.id === captainId);
  const captainAtRisk = captain && isUnavailable(captain.status);

  const totalRoundPts = myPlayers.reduce((s, p) =>
    s + (p.id === captainId ? (p.pts ?? 0) * 2 : (p.pts ?? 0)), 0
  );

  const slots  = MAX_SQUAD - myPlayers.length;
  const byPos  = myPlayers.reduce((acc, p) => { acc[p.pos] = (acc[p.pos] ?? 0) + 1; return acc; }, {});
  const atRisk = myPlayers.filter(p => isUnavailable(p.status));

  function handleCaptainToggle(p) {
    const isCaptain = p.id === captainId;
    setCaptainId(isCaptain ? null : p.id);
    if (!isCaptain && isUnavailable(p.status)) {
      addToast(
        `${p.nick} está ${p.status === 'injured' ? 'lesionado' : 'suspenso'} e provavelmente não vai jogar. Considere outro capitão.`,
        'warning',
        '⚠️ Capitão em risco'
      );
    }
  }

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
            <div className={`text-3xl font-black ${captainAtRisk ? 'text-danger' : 'text-green'}`}>
              {totalRoundPts.toFixed(1)}
            </div>
            <div className="text-xs text-sub">pts na rodada</div>
          </div>
        </div>
      </div>

      {/* Captain-at-risk banner — most urgent alert, shown above everything else */}
      {captainAtRisk && (
        <div className="flex items-start gap-3 bg-danger/12 border border-danger/40 rounded-xl px-4 py-3 mb-4">
          <Siren size={18} className="text-danger mt-0.5 shrink-0 animate-pulse" />
          <div className="flex-1">
            <div className="text-sm font-black text-danger">
              Seu capitão está {captain.status === 'injured' ? 'lesionado' : 'suspenso'}!
            </div>
            <div className="text-xs text-danger/80 mt-0.5">
              <strong>{captain.nick}</strong> provavelmente não vai jogar — você perde a dobradinha do capitão (×2).
              Clique na estrela de outro jogador para trocar.
            </div>
          </div>
        </div>
      )}

      {/* Alert: other injured/suspended players (excluding captain, already shown above) */}
      {(() => {
        const others = atRisk.filter(p => p.id !== captainId);
        if (others.length === 0) return null;
        return (
          <div className="flex items-start gap-3 bg-danger/8 border border-danger/20 rounded-xl px-4 py-3 mb-5">
            <AlertTriangle size={15} className="text-danger mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-danger mb-1.5">
                {others.length} jogador{others.length > 1 ? 'es' : ''} indisponível{others.length > 1 ? 'is' : ''} no elenco
              </div>
              <div className="flex flex-wrap gap-1.5">
                {others.map(p => (
                  <span key={p.id} className="text-[11px] text-danger/90 bg-danger/10 border border-danger/20 rounded-full px-2 py-0.5 font-semibold">
                    {p.nick} · {p.status === 'injured' ? 'Lesionado' : 'Suspenso'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Position summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
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
          <div className="hidden sm:grid grid-cols-[4px_auto_1fr_80px_80px_80px_100px_56px] gap-3 px-4 py-2.5 border-b border-rim text-[10px] text-muted font-bold uppercase tracking-wider">
            <div />
            <div className="w-8" />
            <div>Jogador</div>
            <div className="text-right">Pts</div>
            <div className="text-right">Méd</div>
            <div className="text-right">Status</div>
            <div className="text-center">Capitão</div>
            <div />
          </div>

          {myPlayers.map(p => {
            const isCaptain  = p.id === captainId;
            const injured    = p.status === 'injured';
            const suspended  = p.status === 'suspended';
            const unavail    = injured || suspended;
            const pts        = isCaptain ? (p.pts ?? 0) * 2 : (p.pts ?? 0);

            return (
              <div
                key={p.id}
                className={[
                  'grid grid-cols-[4px_auto_1fr] sm:grid-cols-[4px_auto_1fr_80px_80px_80px_100px_56px]',
                  'items-center gap-3 pr-4 py-3',
                  'border-b border-rim last:border-0 transition-colors',
                  injured   ? 'bg-danger/10 hover:bg-danger/15' :
                  suspended ? 'bg-warn/5    hover:bg-warn/8'    :
                  isCaptain ? 'bg-gold/5    hover:bg-gold/8'    :
                              'hover:bg-rim/30',
                ].join(' ')}
              >
                {/* Left status strip */}
                <div className={[
                  'self-stretch w-1 rounded-r-full',
                  injured   ? 'bg-danger' :
                  suspended ? 'bg-warn'   :
                  isCaptain ? 'bg-gold'   :
                              'bg-transparent',
                ].join(' ')} />

                {/* Avatar */}
                <div className="relative">
                  <Avatar nick={p.nick} pos={p.pos} size="sm" />
                  {unavail && (
                    <span className={[
                      'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border border-bg',
                      injured ? 'bg-danger text-white' : 'bg-warn text-bg',
                    ].join(' ')}>
                      !
                    </span>
                  )}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm truncate ${unavail ? 'text-white/70' : 'text-white'}`}>
                      {p.nick}
                    </span>
                    {isCaptain && (
                      <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 border ${
                        captainAtRisk && p.id === captainId
                          ? 'text-danger bg-danger/15 border-danger/30'
                          : 'text-gold bg-gold/15 border-gold/30'
                      }`}>
                        CAP {captainAtRisk && p.id === captainId ? '⚠' : '×2'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge label={p.pos} small />
                    <span className="text-xs text-sub">{p.club}</span>
                  </div>
                </div>

                {/* Pts */}
                <div className={`text-right text-sm font-bold hidden sm:block ${
                  unavail   ? 'text-danger/60 line-through decoration-danger/40' :
                  isCaptain ? 'text-gold'  :
                              'text-green'
                }`}>
                  {pts.toFixed(1)}
                  {isCaptain && !unavail && <div className="text-[9px] text-gold">×2</div>}
                </div>

                {/* Avg */}
                <div className="text-right text-xs text-sub hidden sm:block">
                  {(p.avg ?? 0).toFixed(1)}
                </div>

                {/* Status badge */}
                <div className="hidden sm:flex justify-end">
                  <PlayerStatusBadge status={p.status} variant="badge" />
                </div>

                {/* Captain toggle */}
                <div className="hidden sm:flex justify-center">
                  <button
                    onClick={() => handleCaptainToggle(p)}
                    title={isCaptain ? 'Remover capitão' : 'Definir como capitão'}
                    className={`p-1.5 rounded-lg transition-all ${
                      isCaptain
                        ? captainAtRisk
                          ? 'text-danger bg-danger/15 hover:bg-danger/25'
                          : 'text-gold bg-gold/15 hover:bg-gold/25'
                        : 'text-muted hover:text-gold hover:bg-gold/10'
                    }`}
                  >
                    <Star size={15} fill={isCaptain ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Drop */}
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
