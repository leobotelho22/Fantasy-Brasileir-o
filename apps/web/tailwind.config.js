/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0A0A1B',
        surface: '#12122A',
        rim:     '#1E1E3F',
        input:   '#1A1A35',
        green: {
          DEFAULT: '#00E676',
          dark:    '#00B248',
          faint:   'rgba(0,230,118,0.094)',
        },
        sub:     '#8888AA',
        muted:   '#4A4A6A',
        danger:  '#FF4444',
        warn:    '#FFB300',
        info:    '#4488FF',
        gold:    '#FFD700',
        silver:  '#C0C0C0',
        bronze:  '#CD7F32',
        gol:     '#FF9800',
        zag:     '#2196F3',
        lat:     '#00BCD4',
        mei:     '#9C27B0',
        ata:     '#F44336',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
