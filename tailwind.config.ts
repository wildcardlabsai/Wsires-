import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        /* CymruSites brand palette */
        cymru: {
          50: '#FDF3F4',
          100: '#FBE3E6',
          200: '#F6C7CE',
          300: '#EE9CA8',
          400: '#E0677A',
          500: '#C8102E',
          600: '#A80E27',
          700: '#8B0F22',
          800: '#711120',
          900: '#5E1220',
        },
        slate: {
          ...{},
        },
        charcoal: {
          50: '#F6F6F5',
          100: '#E8E7E4',
          200: '#D2D0CB',
          300: '#B0ADA5',
          400: '#87837A',
          500: '#6B675F',
          600: '#55524C',
          700: '#46433F',
          800: '#2F2D2A',
          900: '#1C1B19',
          950: '#121110',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#EBE4D7',
          400: '#DDD3C1',
        },
        moss: {
          50: '#F2F6F4',
          100: '#DCE8E2',
          200: '#B8D0C5',
          300: '#8DB1A1',
          400: '#5D8A77',
          500: '#3F6C58',
          600: '#2F5444',
          700: '#264437',
          800: '#1F362D',
          900: '#1A2C25',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(28 27 25 / 0.04), 0 1px 3px 0 rgb(28 27 25 / 0.06)',
        card: '0 2px 4px -1px rgb(28 27 25 / 0.04), 0 8px 24px -6px rgb(28 27 25 / 0.08)',
        lift: '0 8px 16px -6px rgb(28 27 25 / 0.08), 0 20px 40px -12px rgb(28 27 25 / 0.12)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
