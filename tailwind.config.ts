import type { Config } from 'tailwindcss';

/**
 * WoodHub tokens — direction: "Brass Inlay".
 * Grounded in Chiniot woodcraft: sheesham stained near-black, brass (peetal)
 * inlay as the single accent, jali cutwork as the only ornament, and an
 * unbleached-paper band used to let product photography breathe.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171208',       // sheesham, stained near-black
        bark: '#221A0E',      // panel
        raise: '#2E2312',     // raised surface / card
        edge: '#42331C',      // hairline on dark
        birch: '#EFEBE1',     // primary text on dark
        muted: '#A2917A',     // secondary text on dark
        paper: '#E9E6DC',     // unbleached paper ground (light bands)
        chalk: '#F6F4EE',     // card surface on light
        shade: '#D6D0C1',     // hairline on light
        patina: {
          DEFAULT: '#C2934A', // brass inlay — the accent
          soft: '#DCB161',
          deep: '#8C6828',
        },
        ember: '#9B4A2F',     // lacquer red, sale only
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        stamp: '0.18em',
      },
      maxWidth: {
        shell: '82rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        lift: '0 18px 40px -18px rgba(0,0,0,0.65)',
        ring: '0 0 0 1px rgba(194,147,74,0.35)',
      },
      keyframes: {
        'ring-draw': {
          from: { strokeDashoffset: '1400' },
          to: { strokeDashoffset: '0' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'ring-draw': 'ring-draw 2.6s ease-out forwards',
        rise: 'rise .6s cubic-bezier(.22,.9,.3,1) both',
        'sheet-up': 'sheet-up .34s cubic-bezier(.22,.9,.3,1) both',
        fade: 'fade .4s ease both',
        marquee: 'marquee 34s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
