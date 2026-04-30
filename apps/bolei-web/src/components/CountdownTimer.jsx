'use client';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

function calcRemaining(endsAt) {
  const diff = Math.max(0, new Date(endsAt) - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, diff };
}

export default function CountdownTimer({ endsAt, className = '' }) {
  const [rem, setRem] = useState(() => calcRemaining(endsAt));

  useEffect(() => {
    if (rem.diff === 0) return;
    const id = setInterval(() => setRem(calcRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt, rem.diff]);

  if (rem.diff === 0) return <span className={clsx('text-danger font-bold', className)}>Encerrado</span>;

  const urgent = rem.h < 1;
  const pad = n => String(n).padStart(2, '0');

  return (
    <span className={clsx('font-mono font-bold tabular-nums', urgent ? 'text-danger' : 'text-sub', className)}>
      {rem.h > 0 ? `${rem.h}h ${pad(rem.m)}m` : `${pad(rem.m)}:${pad(rem.s)}`}
    </span>
  );
}
