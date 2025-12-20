import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Christmas theme colors
        christmas: {
          red: {
            DEFAULT: '#B91C1C', // 深めの赤
            light: '#DC2626',
            dark: '#991B1B',
            darker: '#7F1D1D',
            bg: '#7F1D1D', // 背景用の赤（明るめに調整）
          },
          white: '#FAFAFA',
          gold: '#F59E0B',
        },
      },
      animation: {
        'snow-fall': 'snowfall linear infinite',
        'snow-accumulate': 'snowAccumulate 0.5s ease-out forwards',
      },
      keyframes: {
        snowfall: {
          '0%': { transform: 'translateY(-10vh) translateX(0)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) translateX(20px)', opacity: '0.8' },
        },
        snowAccumulate: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
