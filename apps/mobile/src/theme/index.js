// Paleta de cores e tokens de design — tema escuro estilo Sleeper

export const colors = {
  bg:           '#0A0A1B',
  card:         '#12122A',
  cardBorder:   '#1E1E3F',
  input:        '#1A1A35',

  green:        '#00E676',
  greenDark:    '#00B248',
  greenFaint:   '#00E67618',

  text:         '#FFFFFF',
  textSub:      '#8888AA',
  textMuted:    '#4A4A6A',

  danger:       '#FF4444',
  warning:      '#FFB300',
  blue:         '#4488FF',

  gold:         '#FFD700',
  silver:       '#C0C0C0',
  bronze:       '#CD7F32',

  posGOL: '#FF9800',
  posZAG: '#2196F3',
  posLAT: '#00BCD4',
  posMEI: '#9C27B0',
  posATA: '#F44336',
};

export const r = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };
export const sp = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const fs = { xs: 11, sm: 13, md: 15, lg: 18, xl: 24, xxl: 32 };

export function posColor(pos) {
  return { GOL: colors.posGOL, ZAG: colors.posZAG, LAT: colors.posLAT,
           MEI: colors.posMEI, ATA: colors.posATA }[pos] ?? colors.textSub;
}
