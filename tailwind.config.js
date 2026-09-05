/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F9F4',
          100: '#D8F3DC',
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788',
          600: '#40916C',
          700: '#2D6A4F',
          800: '#1B4332',
          900: '#081C15',
        },
        cream: {
          50: '#FCFAF7',
          100: '#F8F4EC',
          200: '#F1E9DC',
          300: '#E7DCB6',
          400: '#D8C7A3',
          500: '#C5B187',
        },
        wheat: {
          50: '#FAF6EE',
          100: '#F3ECE2',
          200: '#E5D6C0',
          300: '#D4A373',
          400: '#BC8A5F',
          500: '#8B5E34',
        },
        risk: {
          safe: {
            text: '#166534',
            bg: '#DCFCE7',
            border: '#86EFAC',
            badge: '#15803D',
          },
          warning: {
            text: '#B45309',
            bg: '#FEF3C7',
            border: '#FDE68A',
            badge: '#D97706',
          },
          danger: {
            text: '#991B1B',
            bg: '#FEE2E2',
            border: '#FCA5A5',
            badge: '#DC2626',
          },
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(27, 67, 50, 0.06), 0 2px 6px -1px rgba(27, 67, 50, 0.04)',
        'card': '0 6px 24px -4px rgba(27, 67, 50, 0.08), 0 2px 8px -2px rgba(27, 67, 50, 0.04)',
        'elevated': '0 12px 32px -4px rgba(27, 67, 50, 0.12), 0 4px 12px -2px rgba(27, 67, 50, 0.06)',
        'float': '0 20px 40px -8px rgba(27, 67, 50, 0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        scanLine: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
