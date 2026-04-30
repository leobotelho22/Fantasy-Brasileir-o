'use client';
import { useState, useEffect } from 'react';
import { Clock, Hammer, CheckCircle, Zap } from 'lucide-react';
import Badge from './Badge';
import CoinBalance from './CoinBalance';
import { Avatar } from './PlayerRow';
import clsx from 'clsx';

// Returns ms remaining and % of 12h elapsed
function useAuctionTimer(endsAt) {
  const [state, setState] = useState(() => calcTimer(endsAt));
  useEffect(() => {
    if (state.remaining === 0) return;
    const id = setInterval(() => setState(calcTimer(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt, state.remaining]);
  return state;
}

function calcTimer(endsAt) {
  const remaining = Math.max(0, new Date(endsAt) - Date.now());
  const total     = 12 * 3600_000;
  const pct       = Math.min(100, (remaining / total) * 100);
  return { remaining, pct };
}

function formatTime(ms) {
  if (ms === 0) return 'Encerrado';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function AuctionCard({ auction, isHighBidder, onBid, onSimulateOutbid }) {
  if (!auction?.player) return null;
  const { player } = auction;
  const { remaining, pct } = useAuctionTimer(auction.endsAt);

  const urgent    = remaining < 3600_000 && remaining > 0;  // < 1 hour
  const critical  = remaining < 600_000  && remaining > 0;  // < 10 min
  const finished  = remaining === 0;

  const barColor = critical ? 'bg-danger' : urgent ? 'bg-warn' : 'bg-green';
  const timeColor = critical ? 'text-danger' : urgent ? 'text-warn' : 'text-sub';

  return (
    <div className={clsx(
      'card flex flex-col overflow-hidden transition-all',
      isHighBidder && 'border-green/40',
      critical && !isHighBidder && 'border-danger/30',
    )}>
      {/* Winning banner */}
      {isHighBidder && (
        <div className="flex items-center justify-center gap-1.5 bg-green-glow border-b border-green/20 py-1.5">
          <CheckCircle size={12} className="text-green" />
          <span className="text-green text-xs font-bold">Você está ganhando</span>
        </div>
      )}
      {critical && !isHighBidder && !finished && (
        <div className="flex items-center justify-center gap-1.5 bg-danger/10 border-b border-danger/20 py-1.5">
          <Zap size={12} className="text-danger" />
          <span className="text-danger text-xs font-bold">Encerrando em breve!</span>
        </div>
      )}

      {/* Player header */}
      <div className="flex items-center gap-3 p-4">
        <Avatar nick={player.nick} pos={player.pos} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{player.nick}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge label={player.pos} small />
            <span className="text-xs text-sub">{player.club}</span>
          </div>
        </div>
      </div>

      {/* Time progress bar */}
      <div className="h-1 bg-rim mx-4 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-1000', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Time remaining */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <div className="flex items-center gap-1">
          <Clock size={11} className={timeColor} />
          <span className={clsx('text-xs font-mono font-bold tabular-nums', timeColor)}>
            {finished ? 'Encerrado' : formatTime(remaining)}
          </span>
        </div>
        <span className="text-[10px] text-muted">{auction.numBids} lance{auction.numBids !== 1 ? 's' : ''}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-rim mx-4" />

      {/* Bid info + actions */}
      <div className="flex items-end justify-between gap-3 p-4 pt-3">
        <div>
          <div className="text-[10px] text-muted mb-1">Maior lance</div>
          <CoinBalance amount={auction.currentBid} />
          {auction.highBidder && (
            <div className={clsx('text-xs mt-1', isHighBidder ? 'text-green font-semibold' : 'text-sub')}>
              {isHighBidder ? '👑 Você' : auction.highBidder}
            </div>
          )}
          {!auction.highBidder && (
            <div className="text-xs text-muted mt-1">Sem lances ainda</div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {!finished && (
            isHighBidder ? (
              // When winning: show "increase bid" option + simulate outbid button
              <div className="flex flex-col items-end gap-1.5">
                <button
                  onClick={onBid}
                  className="flex items-center gap-1.5 border border-green/40 text-green text-xs font-bold rounded-full px-3 py-1.5 hover:bg-green-glow transition-colors"
                >
                  <Hammer size={11} />
                  Aumentar
                </button>
                {onSimulateOutbid && (
                  <button
                    onClick={onSimulateOutbid}
                    title="Simular rival dando lance (demo)"
                    className="text-[10px] text-muted hover:text-warn transition-colors underline"
                  >
                    simular rival →
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onBid}
                className="flex items-center gap-1.5 bg-green text-bg text-xs font-bold rounded-full px-4 py-2 hover:bg-green-dark transition-colors"
              >
                <Hammer size={13} />
                Dar lance
              </button>
            )
          )}
          {finished && (
            <span className="text-xs text-muted font-semibold">Encerrado</span>
          )}
        </div>
      </div>
    </div>
  );
}
