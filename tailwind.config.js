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
          100: '#E8F2E9',
          200: '#CBE5D4',
          300: '#9DD2B6',
          400: '#64B892',
          500: '#36B98A',
          600: '#25996D',
          700: '#1B7C54',
          800: '#176B45',
          900: '#174D35',
          950: '#0C2D1F',
        },
        sage: {
          50: '#F5F9F6',
          100: '#E8F2E9',
          200: '#D5E6D8',
          300: '#B8D5BE',
          400: '#94BE9D',
          500: '#71A47C',
        },
        cream: {
          50: '#FCFAF7',
          100: '#F7F6F0',
          200: '#EFECE2',
          300: '#E4DFD0',
          400: '#D2CBB7',
          500: '#B8AE96',
        },
        gold: {
          50: '#FEFDF8',
          100: '#FDF7E7',
          200: '#FAECC4',
          300: '#F8DE97',
          400: '#F6BD28',
          500: '#E5A812',
          600: '#C28909',
        },
        wheat: {
          50: '#FAF6EE',
          100: '#F7F6F0',
          200: '#EFECE2',
          300: '#D4A373',
          400: '#BC8A5F',
          500: '#8B5E34',
        },
        risk: {
          safe: {
            text: '#176B45',
            bg: '#E8F2E9',
            border: '#B8D5BE',
            badge: '#176B45',
          },
          warning: {
            text: '#B45309',
            bg: '#FEF7E7',
            border: '#FAECC4',
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
        'soft': '0 4px 20px -2px rgba(23, 77, 53, 0.05), 0 2px 6px -1px rgba(23, 77, 53, 0.03)',
        'card': '0 8px 24px -4px rgba(23, 77, 53, 0.07), 0 2px 8px -2px rgba(23, 77, 53, 0.03)',
        'glass': '0 8px 32px 0 rgba(23, 77, 53, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-active': '0 12px 36px 0 rgba(23, 77, 53, 0.14), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95)',
        'bubble': '0 10px 28px -4px rgba(23, 77, 53, 0.08), 0 4px 10px -2px rgba(23, 77, 53, 0.04), inset 0 1.5px 1px rgba(255, 255, 255, 0.85)',
        'float-glow': '0 16px 36px -6px rgba(23, 107, 69, 0.28), 0 6px 16px -2px rgba(54, 185, 138, 0.2)',
        'elevated': '0 12px 32px -4px rgba(23, 77, 53, 0.12), 0 4px 12px -2px rgba(23, 77, 53, 0.06)',
        'float': '0 20px 40px -8px rgba(23, 77, 53, 0.18)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring-snappy': 'cubic-bezier(0.18, 0.9, 0.28, 1)',
        'decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'standard': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        'instant': '120ms',
        'fast': '180ms',
        'normal': '240ms',
        'medium': '320ms',
        'page': '380ms',
        'modal': '420ms',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanLine 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'fadeIn': 'fadeIn 300ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scaleUp': 'scaleUp 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slideUp': 'slideUp 340ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'radar-glow-high': 'radarGlowHigh 3.2s ease-in-out infinite',
        'radar-glow-med': 'radarGlowMed 4.5s ease-in-out infinite',
        'alert-glow': 'alertGlow 3s ease-in-out infinite',
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
          '50%': { transform: 'translateY(-4px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(3px, -5px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 16px 36px -6px rgba(23, 107, 69, 0.28)' },
          '50%': { boxShadow: '0 20px 44px -4px rgba(54, 185, 138, 0.42)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.97) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        radarGlowHigh: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.06)', opacity: '0.98' },
        },
        radarGlowMed: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.75' },
          '50%': { transform: 'scale(1.04)', opacity: '0.88' },
        },
        alertGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)' },
          '50%': { opacity: '0.92', boxShadow: '0 0 12px 2px rgba(220, 38, 38, 0.25)' },
        },
      }
    },
  },
  plugins: [],
}
