
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

        indigo: {
            '50': '#F1F3FF',
            '100': '#E6E9FF',
            '400': '#6873FF',
            '500': '#3B46E0',  // Primary accent
            '600': '#2A37C0',
          '700': '#1E2A8A',  // Dark blue for headings
        },
        
        ink: {
          '100': '#EEF0F7',  // Lightest - hover backgrounds
          '200': '#D6DAE9',  // Light - secondary backgrounds
          '300': '#A8AECB',
          '400': '#6B75A3',  // Medium - secondary text
          '500': '#3A4474',  // Default text color
          '700': '#1A2244',  // Darker text
          '900': '#0B1020',  // Darkest - primary text
        },
        
        // Paper - Page background
        paper: '#F7F8FC',
        },

        fontFamily: {
        // Using Next.js local font variable from layout.tsx
        serif: ['var(--font-serif)', 'Instrument Serif', 'serif'],
        sans: ['var(--font-sans)', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Geist Mono', 'monospace'],
        },

        spacing: {
        '2.75': '0.6875rem',  // 11px (gap in user chip)
        '3.5': '0.875rem',    // 14px
        '4.5': '1.125rem',    // 18px (sidebar padding-x)
        '5.5': '1.375rem',    // 22px (active bar height)
        '7': '1.75rem',       // 28px (sidebar padding-top)
        '8.5': '2.125rem',    // 34px (avatar size)
        '30': '7.5rem',       // 120px (upgrade card glow)
        },

      // FONT SIZES 
        fontSize: {
        '10.5px': ['10.5px', { lineHeight: '1.6' }],
        '11.5px': ['11.5px', { lineHeight: '1.6' }],
        '12.5px': ['12.5px', { lineHeight: '1.6' }],
        '19px': ['19px', { lineHeight: '1.5' }],
        },

        borderRadius: {
        'sm': '8px',   // --radius-sm
        'md': '12px',  // --radius-md
        'lg': '16px',  // --radius-lg
        '2xl': '16px', // Same as lg
        },


        boxShadow: {
        // Sidebar elevation shadow
        'elevation': '0 24px 48px -16px rgba(30, 42, 138, 0.12), 0 8px 16px -8px rgba(15, 23, 42, 0.04)',
        
        // Alternative shadows if needed
        'sm': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 1px rgba(15, 23, 42, 0.03)',
        },

        letterSpacing: {
        'wider': '0.12em',    // For nav labels
        'widest': '-0.02em',  // For brand
        },

        transitionDuration: {
        '180': '180ms',  // For nav-item transitions
        '150': '150ms',  // For button/chip transitions
        },

        opacity: {
        '18': '0.18',
        },
    },
    },

    plugins: [],
}

export default config