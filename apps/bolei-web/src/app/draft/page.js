'use client';
import { useState, useMemo } from 'react';
import { Search, X, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Badge from '@/components/Badge';
import { Avatar } from '@/components/PlayerRow';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

const POSITIONS = ['TODOS', 'GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

export default function DraftPage() {
  const { team, draft, makeDraftPick } = useStore();
  const [tab,       setTab]       = useState('available'); // 'available' | 'board'
  const [search,    setSearch]    = useState('');
  const [posFilter, setPosFilter] = useState('TODOS');

  const pickedIds = useMemo(
    () => new Set((draft.picks ?? []).map(pk => pk.playerId)),
    [draft.picks]
  );

  const available = useMemo(() =>
    ALL_PLAYERS
      .filter(p => !pickedIds.has(p.id))
      .filter(p => posFilter === 'TODOS' || p.pos === posFilter)
      .filter(p => !search ||
        p.nick.toLowerCase().includes(search.toLowerCase()) ||
        p.club.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)),
    [pickedIds, posFilter, search]
  );

  const isMyTurn   = draft.currentTeam === 'team_me';
  const totalPicks = (draft.teams?.length ?? 8) * 23; // 23 rounds max
  const progress   = Math.min(((draft.currentPick - 1) / totalPicks) * 100, 100);

  function handlePick(playerId) {
    if (!isMyTurn) return;
    makeDraftPick(playerId);
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">Draft</h1>
        <p className="text-sub text-sm mt-1">Snake Draft · Pick {draft.currentPick} de {totalPicks}</p>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl border px-4 py-3 mb-4 flex items-center justify-between gap-3 ${
        isMyTurn
          ? 'bg-green-glow border-green/30'
          : 'bg-surface border-rim'
      }`}>
        <div className="flex items-center gap-2">
          {isMyTurn ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
              <span className="text-green font-bold text-sm">É a sua vez! Escolha um jogador.</span>
            </>
          ) : (
            <>
              <Clock size={14} className="text-sub" />
              <span className="text-sub text-sm">Aguardando <span className="text-white font-semibold">{draft.currentTeamName}</span>...</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted">Pick</span>
          <span className="bg-rim rounded-full px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
            {draft.currentPick}/{totalPicks}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-rim rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-green rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tabs */}
      <div className="flex bg-surface border border-rim rounded-lg p-1 mb-5 gap-1 w-fit">
        {[['available','Disponíveis'],['board','Board']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === key ? 'bg-bg text-white border border-rim' : 'text-sub hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'available' ? (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Available players panel */}
          <div>
            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 bg-input border border-rim rounded-lg px-3 py-2 focus-within:border-green/40 transition-colors">
                <Search size={14} className="text-sub" />
                <input
                  type="text"
                  placeholder="Buscar jogador ou clube..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none"
                />
                {search && <button onClick={() => setSearch('')}><X size={13} className="text-muted" /></button>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {POSITIONS.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      posFilter === pos
                        ? 'bg-green-glow border-green/30 text-green'
                        : 'border-rim text-sub hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Player list */}
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {available.length === 0 ? (
                <div className="card p-10 text-center text-sub text-sm">Nenhum jogador encontrado.</div>
              ) : available.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-surface border border-rim rounded-lg px-4 py-3 hover:border-[#253354] transition-colors"
                >
                  <Avatar nick={p.nick} pos={p.pos} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{p.nick}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge label={p.pos} small />
                      <span className="text-xs text-sub">{p.club}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <div className="text-green font-bold">{(p.pts ?? 0).toFixed(1)}</div>
                    <div className="text-muted text-xs">méd {(p.avg ?? 0).toFixed(1)}</div>
                  </div>
                  {isMyTurn && (
                    <button
                      onClick={() => handlePick(p.id)}
                      className="ml-2 bg-green text-bg text-xs font-bold px-4 py-2 rounded-full hover:bg-green-dark transition-colors shrink-0"
                    >
                      Pegar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* My picks so far */}
          <div>
            <div className="text-sm font-bold text-white mb-3">
              Meus picks ({(draft.picks ?? []).filter(pk => pk.teamId === 'team_me').length})
            </div>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {(draft.picks ?? [])
                .filter(pk => pk.teamId === 'team_me')
                .map(pk => {
                  const p = ALL_PLAYERS.find(x => x.id === pk.playerId);
                  if (!p) return null;
                  return (
                    <div key={pk.pickNumber} className="flex items-center gap-3 bg-surface border border-rim rounded-lg px-3 py-2">
                      <span className="text-xs text-muted w-8 tabular-nums text-right">#{pk.pickNumber}</span>
                      <Avatar nick={p.nick} pos={p.pos} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate block">{p.nick}</span>
                        <div className="flex gap-1 mt-0.5">
                          <Badge label={p.pos} small />
                        </div>
                      </div>
                    </div>
                  );
                })}
              {(draft.picks ?? []).filter(pk => pk.teamId === 'team_me').length === 0 && (
                <div className="card p-6 text-center text-sub text-xs">Nenhum pick ainda.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <DraftBoard draft={draft} />
      )}
    </AppLayout>
  );
}

function DraftBoard({ draft }) {
  const numTeams = draft.teams?.length ?? 8;
  const picks    = draft.picks ?? [];
  const rounds   = Math.max(1, Math.ceil((picks.length + 1) / numTeams));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[640px]">
        <thead>
          <tr>
            <th className="text-muted font-bold text-left px-2 py-2 w-10">#</th>
            {(draft.teams ?? []).map(t => (
              <th key={t.id} className={`px-2 py-2 text-center font-bold ${t.id === 'team_me' ? 'text-green' : 'text-sub'}`}>
                <span className="truncate block max-w-[90px]">{t.name.split(' ')[0]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }).map((_, rdIdx) => {
            const round     = rdIdx + 1;
            const teamOrder = round % 2 === 1
              ? draft.teams
              : [...(draft.teams ?? [])].reverse();

            return (
              <tr key={round} className="border-t border-rim">
                <td className="px-2 py-1.5 text-muted font-bold">R{round}</td>
                {(draft.teams ?? []).map(t => {
                  const posInOrder = teamOrder.findIndex(x => x.id === t.id);
                  const pick       = picks[(rdIdx * numTeams) + posInOrder];
                  const player     = pick ? ALL_PLAYERS.find(p => p.id === pick.playerId) : null;
                  const isMe       = t.id === 'team_me';
                  const isCurrent  = !pick && rdIdx * numTeams + posInOrder === picks.length;

                  return (
                    <td key={t.id} className="px-1.5 py-1.5">
                      <div className={`rounded-lg p-1.5 min-h-[52px] flex flex-col items-center justify-center text-center border transition-colors ${
                        isMe
                          ? 'bg-green-glow border-green/20'
                          : 'bg-bg border-rim'
                      } ${isCurrent ? 'border-green/60 ring-1 ring-green/30 animate-pulse' : ''}`}>
                        {player ? (
                          <>
                            <span className="font-semibold text-white leading-tight truncate w-full text-center">{player.nick}</span>
                            <Badge label={player.pos} small />
                          </>
                        ) : isCurrent ? (
                          <span className="text-green text-[10px] font-bold">← Agora</span>
                        ) : (
                          <span className="text-[#1A2540]">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
