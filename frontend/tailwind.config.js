/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          0: '#03070F',
          1: '#070D1A',
          2: '#0C1526',
          3: '#111E35',
          4: '#172545',
        },
        cyan: {
          DEFAULT: '#00D4FF',
          dim: 'rgba(0,212,255,0.15)',
          glow: 'rgba(0,212,255,0.4)',
        },
        gold: { DEFAULT: '#FFB800', dim: 'rgba(255,184,0,0.15)' },
        emerald: { DEFAULT: '#00E5A0' },
        rose: { DEFAULT: '#FF4D6D' },
        violet: { DEFAULT: '#A855F7' },
      },
      boxShadow: {
        cyan: '0 0 30px rgba(0,212,255,0.4)',
        gold: '0 0 30px rgba(255,184,0,0.4)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,255,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0,212,255,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
