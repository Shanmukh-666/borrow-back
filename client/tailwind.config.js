/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          tint: '#CCFBF1',
        },
        surface: '#FFFFFF',
        appBg: '#F8FAFC',
        textPrimary: '#0F172A',
        textBody: '#334155',
        textMuted: '#64748B',
        appBorder: '#E2E8F0',
        appSuccess: '#15803D',
        appWarning: '#B45309',
        appDanger: '#B91C1C',
        appAccent: '#F59E0B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        field: '10px',
        btn: '10px',
      }
    },
  },
  plugins: [],
}
