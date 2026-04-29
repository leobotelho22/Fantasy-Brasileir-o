import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { colors, fs } from '../theme';

// Timer regressivo que atualiza todo segundo
export default function CountdownTimer({ endsAt, style, urgentColor = colors.danger }) {
  const [display, setDisplay] = useState('');
  const [urgent,  setUrgent]  = useState(false);

  useEffect(() => {
    function tick() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setDisplay('Encerrado'); setUrgent(true); return; }

      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);

      setUrgent(diff < 3_600_000); // vermelho no último 1h
      setDisplay(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <Text style={[{ color: urgent ? urgentColor : colors.green,
                    fontWeight: '700', fontSize: fs.sm }, style]}>
      {display}
    </Text>
  );
}
