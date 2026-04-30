import clsx from 'clsx';

// Maps a player status value to display config
const STATUS_CONFIG = {
  probable:  { dot: 'bg-green',  label: 'Provável',  text: 'text-green'  },
  bench:     { dot: 'bg-warn',   label: 'Banco',     text: 'text-warn'   },
  injured:   { dot: 'bg-danger', label: 'Lesionado', text: 'text-danger' },
  suspended: { dot: 'bg-warn',   label: 'Suspenso',  text: 'text-warn'   },
};

/**
 * Compact status indicator.
 *
 * variant="dot"    → coloured dot only (for tight spaces like table rows)
 * variant="badge"  → dot + label text
 * variant="full"   → dot + label inside a pill (default)
 */
export default function PlayerStatusBadge({ status, variant = 'full' }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  if (variant === 'dot') {
    return (
      <span
        title={cfg.label}
        className={clsx('inline-block w-2 h-2 rounded-full shrink-0', cfg.dot)}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <span className={clsx('flex items-center gap-1 text-xs font-semibold', cfg.text)}>
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
        {cfg.label}
      </span>
    );
  }

  // full — pill shape
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border',
      status === 'probable'  && 'bg-green-glow  text-green  border-green/30',
      status === 'bench'     && 'bg-warn/15     text-warn   border-warn/30',
      status === 'injured'   && 'bg-danger/15   text-danger border-danger/30',
      status === 'suspended' && 'bg-warn/15     text-warn   border-warn/30',
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
