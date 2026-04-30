import { Clock, Hammer, CheckCircle } from 'lucide-react';
import Badge from './Badge';
import CoinBalance from './CoinBalance';
import CountdownTimer from './CountdownTimer';
import { Avatar } from './PlayerRow';
import clsx from 'clsx';

export default function AuctionCard({ auction, isHighBidder, onBid }) {
  if (!auction?.player) return null;
  const { player } = auction;

  return (
    <div className={clsx(
      'card p-4 flex flex-col gap-3 transition-all',
      isHighBidder && 'border-green/30 bg-green-glow/30'
    )}>
      {/* Player header */}
      <div className="flex items-center gap-3">
        <Avatar nick={player.nick} pos={player.pos} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{player.nick}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge label={player.pos} small />
            <span className="text-xs text-sub">{player.club}</span>
          </div>
        </div>
        {/* Countdown */}
        <div className="flex items-center gap-1 bg-rim rounded-full px-2.5 py-1 shrink-0">
          <Clock size={11} className="text-sub" />
          <CountdownTimer endsAt={auction.endsAt} className="text-xs" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-rim" />

      {/* Bid info + action */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-muted mb-1">Lance atual</div>
          <CoinBalance amount={auction.currentBid} />
          <div className="text-xs text-sub mt-1">
            {auction.numBids === 0
              ? 'Sem lances ainda'
              : `${auction.numBids} lance${auction.numBids !== 1 ? 's' : ''} · ${auction.highBidder}`}
          </div>
        </div>

        {isHighBidder ? (
          <div className="flex items-center gap-1.5 bg-green-glow border border-green/30 rounded-full px-3 py-1.5">
            <CheckCircle size={13} className="text-green" />
            <span className="text-green text-xs font-bold">Ganhando</span>
          </div>
        ) : (
          <button
            onClick={onBid}
            className="flex items-center gap-1.5 bg-green text-bg text-xs font-bold rounded-full px-4 py-2 hover:bg-green-dark transition-colors"
          >
            <Hammer size={13} />
            Dar lance
          </button>
        )}
      </div>
    </div>
  );
}
