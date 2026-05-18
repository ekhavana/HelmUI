import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marine: {
          950: '#020617',
          900: '#07111f',
          850: '#0a1728',
          800: '#0f2238',
          700: '#183451',
        },
        safety: {
          safe: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          active: '#22d3ee',
        },
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 28px rgba(34, 211, 238, 0.18)',
        danger: '0 0 30px rgba(239, 68, 68, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
