import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d0f13',
        foreground: '#f8fafc',
        muted: '#1c2230',
        accent: '#00c2a8',
      },
    },
  },
  plugins: [],
} satisfies Config
