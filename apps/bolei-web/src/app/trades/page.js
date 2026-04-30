'use client';
import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp, Check, X, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Badge from '@/components/Badge';
import CoinBalance from '@/components/CoinBalance';
import { Avatar } from '@/components/PlayerRow';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

export default function TradesPage() {
  const { trades, coins, acceptTrade, rejectTrade } = useStore();
  const [tab, setTab] = useState('incoming');

  const incoming = trades.filter(t => t.toTeamId   === 'team_me' && t.status === 'pending');
  const outgoing = trades.filter(t => t.fromTeamId === 'team_me' && t.status === 'pending');

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Trades</h1>
          <p className="text-sub text-sm mt-1">Propostas de troca de jogadores e moedas</p>
        </div>
        <CoinBalance amount={coins} />
      </div>

      {/* Tabs */}
      <div className="flex bg-surface border border-rim rounded-lg p-1 mb-6 gap-1 w-fit">
        {[
          ['incoming', `Recebidas (${incoming.length})`],
          ['outgoing', `Enviadas (${outgoing.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === key ? 'bg-bg text-white border border-rim' : 'text-sub hover:text-white'
            }`}
          >
            {key === 'incoming' && incoming.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green rounded-full" />
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Trade list */}
      <div className="space-y-4 max-w-2xl">
        {tab === 'incoming' && (
          incoming.length === 0
            ? <EmptyState icon="📬" message="Nenhuma proposta recebida no momento." />
            : incoming.map(t => (
                <TradeCard
                  key={t.id}
                  trade={t}
                  direction="incoming"
                  onAccept={() => acceptTrade(t.id)}
                  onReject={() => rejectTrade(t.id)}
                />
              ))
        )}
        {tab === 'outgoing' && (
          outgoing.length === 0
            ? <EmptyState icon="📤" message="Você não enviou nenhuma proposta ainda." />
            : outgoing.map(t => (
                <TradeCard
                  key={t.id}
                  trade={t}
                  direction="outgoing"
                  onReject={() => rejectTrade(t.id)}
                />
              ))
        )}
      </div>
    </AppLayout>
  );
}

function TradeCard({ trade, direction, onAccept, onReject }) {
  const [open, setOpen] = useState(true);

  const offered   = (trade.offeredPlayers   ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean);
  const requested = (trade.requestedPlayers ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean);

  const isIncoming = direction === 'incoming';

  return (
    <div className={`card overflow-hidden transition-all ${isIncoming ? 'border-info/20' : 'border-rim'}`}>
      {/* Card header (always visible) */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rim/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isIncoming ? 'bg-info/15 text-info' : 'bg-sub/10 text-sub'
        }`}>
          {isIncoming ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-bold text-white">
            {isIncoming ? `Proposta de ${trade.fromTeamName}` : `Para ${trade.toTeamName}`}
          </div>
          <div className="text-xs text-sub mt-0.5">
            {offered.length} jogador{offered.length !== 1 ? 'es' : ''}
            {(trade.offeredCoins ?? 0) > 0 && ` + ${trade.offeredCoins} moedas`}
            {' por '}
            {requested.length} jogador{requested.length !== 1 ? 'es' : ''}
            {(trade.requestedCoins ?? 0) > 0 && ` + ${trade.requestedCoins} moedas`}
          </div>
        </div>
        <div className="text-muted shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-rim px-4 py-4 space-y-4">
          {/* Players grid */}
          <div className="grid sm:grid-cols-[1fr_40px_1fr] gap-3 items-start">
            {/* Column 1 */}
            <PlayerColumn
              label={isIncoming ? 'Eles oferecem' : 'Você oferece'}
              players={offered}
              coins={trade.offeredCoins ?? 0}
            />

            {/* Arrow */}
            <div className="hidden sm:flex items-center justify-center pt-8">
              <ArrowUpRight size={18} className="text-muted" />
            </div>

            {/* Column 2 */}
            <PlayerColumn
              label={isIncoming ? 'Eles pedem' : 'Você pede'}
              players={requested}
              coins={trade.requestedCoins ?? 0}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isIncoming ? (
              <>
                <button
                  onClick={onReject}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-danger/10 text-danger border border-danger/30 text-sm font-bold py-2.5 rounded-lg hover:bg-danger/20 transition-colors"
                >
                  <X size={14} />
                  Recusar
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green text-bg text-sm font-bold py-2.5 rounded-lg hover:bg-green-dark transition-colors"
                >
                  <Check size={14} />
                  Aceitar trade
                </button>
              </>
            ) : (
              <button
                onClick={onReject}
                className="flex items-center gap-1.5 text-xs text-sub border border-rim rounded-lg px-4 py-2 hover:text-danger hover:border-danger/30 transition-colors"
              >
                <X size={12} />
                Cancelar proposta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerColumn({ label, players, coins }) {
  return (
    <div>
      <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-2">{label}</div>
      <div className="space-y-1.5">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-2 bg-bg rounded-lg px-2.5 py-2">
            <Avatar nick={p.nick} pos={p.pos} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{p.nick}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge label={p.pos} small />
                <span className="text-xs text-sub">{p.club}</span>
              </div>
            </div>
            <div className="text-xs text-green font-bold shrink-0">{(p.pts ?? 0).toFixed(1)}</div>
          </div>
        ))}
        {coins > 0 && (
          <div className="flex items-center gap-2 bg-bg rounded-lg px-2.5 py-2">
            <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
              <span className="text-gold text-xs font-black">$</span>
            </div>
            <CoinBalance amount={coins} />
          </div>
        )}
        {players.length === 0 && coins === 0 && (
          <div className="text-xs text-muted italic px-1">Nada</div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="card p-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sub text-sm">{message}</p>
    </div>
  );
}
