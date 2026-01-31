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
        // New Year theme colors
        newyear: {
          red: {
            DEFAULT: '#DC2626', // 日本の赤
            light: '#EF4444',
            dark: '#B91C1C',
            darker: '#991B1B',
          },
          gold: {
            DEFAULT: '#F59E0B', // 金色
            light: '#FBBF24',
            dark: '#D97706',
          },
          white: '#FFFFFF',
          cream: '#FFFBEB', // 和紙のようなクリーム色
        },
        // Valentine theme colors
        valentine: {
          red: {
            DEFAULT: '#8A0000', // 深い赤
            light: '#A30000',
            dark: '#6A0000',
          },
          brown: {
            DEFAULT: '#3B060A', // ダークチョコ色
            light: '#5A0A10',
            chocolate: '#5D2A1A',
          },
          milk: {
            DEFAULT: '#D4A574', // ミルクチョコ色
            light: '#E4B584',
            dark: '#C49464',
          },
          cream: '#FFF5EB', // クリーム背景
        },
      },
      animation: {
        'snow-fall': 'snowfall linear infinite',
        'snow-accumulate': 'snowAccumulate 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
