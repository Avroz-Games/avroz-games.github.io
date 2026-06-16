/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        surface: {
          900: '#0a0e17',
          800: '#111827',
          700: '#1a2234',
          600: '#243049',
        },
        accent: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(34,211,238,0.18), transparent)',
        'card-glow': 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(168,85,247,0.06) 100%)',
      },
      boxShadow: {
        neon: '0 0 20px rgba(34, 211, 238, 0.25)',
        'neon-sm': '0 0 10px rgba(34, 211, 238, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34, 211, 238, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(34, 211, 238, 0.45)' },
        },
      },
    },
  },
  plugins: [],
}
