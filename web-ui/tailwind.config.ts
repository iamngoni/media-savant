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
        primary: '#7c3aed',
        'card-bg': '#161b22',
        'hover-bg': '#21262d',
        border: '#30363d',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to right, rgba(13,15,19,1) 0%, rgba(13,15,19,0.85) 40%, rgba(13,15,19,0.4) 70%, transparent 100%)',
        'gradient-fade': 'linear-gradient(to top, rgba(13,15,19,1) 0%, rgba(13,15,19,0.8) 30%, transparent 100%)',
        'gradient-card': 'linear-gradient(to top, rgba(13,15,19,0.9) 0%, transparent 60%)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
