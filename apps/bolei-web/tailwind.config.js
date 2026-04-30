/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080B14',
        surface: '#0F1628',
        rim:     '#1A2540',
        input:   '#141E35',
        green: {
          DEFAULT: '#00E676',
          dark:    '#00A957',
          glow:    'rgba(0,230,118,0.10)',
        },
        sub:     '#8B9DBF',
        muted:   '#3D506B',
        danger:  '#FF4D4D',
        warn:    '#FFB300',
        info:    '#4A9EFF',
        gold:    '#FFD700',
        silver:  '#B0BAD4',
        bronze:  '#CD7F32',
        gol:     '#FF9800',
        zag:     '#2196F3',
        lat:     '#00BCD4',
        mei:     '#9C27B0',
        ata:     '#F44336',
      },
    },
  },
  plugins: [],
};
