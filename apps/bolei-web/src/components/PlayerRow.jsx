import clsx from 'clsx';
import Badge from './Badge';
import PlayerStatusBadge from './PlayerStatusBadge';

const POS_BG = {
  GOL: 'bg-gol/20 text-gol',
  ZAG: 'bg-zag/20 text-zag',
  LAT: 'bg-lat/20 text-lat',
  MEI: 'bg-mei/20 text-mei',
  ATA: 'bg-ata/20 text-ata',
};

export function Avatar({ nick, pos, size = 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-base';
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-black shrink-0', sz, POS_BG[pos] ?? 'bg-rim text-sub')}>
      {nick?.[0] ?? '?'}
    </div>
  );
}

export default function PlayerRow({ player, right, action, compact = false }) {
  if (!player) return null;

  return (
    <div className={clsx(
      'flex items-center gap-3 bg-surface border border-rim rounded-lg transition-colors hover:border-[#253354]',
      compact ? 'px-3 py-2' : 'px-4 py-3'
    )}>
      <Avatar nick={player.nick} pos={player.pos} size={compact ? 'sm' : 'md'} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-white truncate">
            {player.nick}
          </span>
          {player.status && (
            <PlayerStatusBadge status={player.status} variant="full" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge label={player.pos} small />
          <span className="text-xs text-sub truncate">{player.club}</span>
        </div>
      </div>

      {/* Right: pts or custom content */}
      {right ?? (
        <div className="text-right shrink-0">
          <div className="text-green font-bold text-sm">{(player.pts ?? 0).toFixed(1)}</div>
          <div className="text-muted text-xs">méd {(player.avg ?? 0).toFixed(1)}</div>
        </div>
      )}

      {/* Action button */}
      {action && (
        <div className="shrink-0 ml-1">{action}</div>
      )}
    </div>
  );
}
