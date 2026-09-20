/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F8FB',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#EEF3F7',
          hover: '#F5F9FC',
          active: '#E8F4FA',
        },
        border: {
          DEFAULT: '#D8E1E8',
          light: '#E0E6EB',
          focus: '#176B9E',
        },
        navy: '#102A43',
        frost: '#17212B',
        mist: '#5F6E7B',
        steel: '#86939F',
        icon: {
          DEFAULT: '#71808C',
          active: '#176B9E',
        },
        accent: {
          DEFAULT: '#176B9E',
          bright: '#2C9EDB',
          soft: '#E6F4FB',
          dim: '#155A85',
        },
        success: '#2E8B62',
        warning: '#B7791F',
        danger: '#C94A4A',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['clamp(1.5rem, 3.5vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'display-md': ['clamp(1.125rem, 2.5vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.625rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(23, 33, 43, 0.06), 0 1px 2px rgba(23, 33, 43, 0.04)',
        'card-hover': '0 4px 12px rgba(23, 33, 43, 0.08), 0 2px 4px rgba(23, 33, 43, 0.04)',
        'sidebar': '1px 0 0 #D8E1E8',
      },
      animation: {
        'orbit': 'orbit 60s linear infinite',
        'blink': 'blink 1s steps(1) infinite',
      },
      keyframes: {
        orbit: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
}
