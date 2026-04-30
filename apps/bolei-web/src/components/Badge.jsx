import clsx from 'clsx';

const POS_STYLE = {
  GOL: 'bg-gol/20    text-gol    border-gol/40',
  ZAG: 'bg-zag/20    text-zag    border-zag/40',
  LAT: 'bg-lat/20    text-lat    border-lat/40',
  MEI: 'bg-mei/20    text-mei    border-mei/40',
  ATA: 'bg-ata/20    text-ata    border-ata/40',
  TEC: 'bg-gold/20   text-gold   border-gold/40',
};

const STATUS_STYLE = {
  available:  'bg-green-glow  text-green  border-green/30',
  injured:    'bg-danger/15   text-danger border-danger/40',
  suspended:  'bg-warn/15     text-warn   border-warn/40',
};

export default function Badge({ label, type = 'pos', small = false }) {
  const style =
    type === 'status' ? (STATUS_STYLE[label] ?? 'bg-rim text-sub border-rim') :
    (POS_STYLE[label] ?? 'bg-rim text-sub border-rim');

  return (
    <span
      className={clsx(
        'inline-flex items-center font-bold border rounded',
        style,
        small ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      )}
    >
      {label}
    </span>
  );
}
