import { Coins } from 'lucide-react';
import clsx from 'clsx';

export default function CoinBalance({ amount = 0, small = false }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-bold text-gold',
      small ? 'text-xs' : 'text-sm'
    )}>
      <Coins size={small ? 12 : 15} className="text-gold" />
      {amount.toLocaleString('pt-BR')}
    </span>
  );
}
